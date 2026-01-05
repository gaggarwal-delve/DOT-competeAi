/**
 * CSV Export Utility Functions
 * Handles conversion of data to CSV format and browser downloads
 */

export interface CSVExportOptions {
  filename: string;
  headers: string[];
  data: any[];
  dataMapper: (item: any) => any[];
}

/**
 * Converts array data to CSV string
 */
export function arrayToCSV(headers: string[], rows: any[][]): string {
  const escapeCsvValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    
    const stringValue = String(value);
    // Escape quotes and wrap in quotes if contains comma, newline, or quote
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const csvHeaders = headers.map(escapeCsvValue).join(',');
  const csvRows = rows.map(row => 
    row.map(escapeCsvValue).join(',')
  ).join('\n');

  return `${csvHeaders}\n${csvRows}`;
}

/**
 * Triggers browser download of CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Main export function - converts data to CSV and triggers download
 */
export function exportToCSV(options: CSVExportOptions): void {
  const { filename, headers, data, dataMapper } = options;
  
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }
  
  const rows = data.map(dataMapper);
  const csvContent = arrayToCSV(headers, rows);
  const timestamp = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${timestamp}.csv`;
  
  downloadCSV(csvContent, fullFilename);
}

/**
 * Export companies to CSV
 */
export function exportCompaniesCSV(companies: any[]): void {
  exportToCSV({
    filename: 'competeai_companies',
    headers: [
      'Company Name',
      'Ticker',
      'Market Cap (B)',
      'Headquarters',
      'Focus Areas',
      'Pipeline Count',
      'Recent Approvals'
    ],
    data: companies,
    dataMapper: (company) => [
      company.name,
      company.ticker || 'N/A',
      company.marketCap ? `$${company.marketCap}B` : 'N/A',
      company.headquarters || 'N/A',
      Array.isArray(company.focusAreas) ? company.focusAreas.join('; ') : company.focusAreas || 'N/A',
      company.pipelineCount || 0,
      company.recentApprovals || 0
    ]
  });
}

/**
 * Export clinical trials to CSV
 */
export function exportTrialsCSV(trials: any[]): void {
  exportToCSV({
    filename: 'competeai_clinical_trials',
    headers: [
      'NCT ID',
      'Title',
      'Sponsor',
      'Linked Company',
      'Phase',
      'Status',
      'Condition',
      'Start Date',
      'Enrollment'
    ],
    data: trials,
    dataMapper: (trial) => [
      trial.nctId || trial.protocolSection?.identificationModule?.nctId || 'N/A',
      trial.title || trial.protocolSection?.identificationModule?.officialTitle || 'N/A',
      trial.sponsor || trial.protocolSection?.sponsorCollaboratorsModule?.leadSponsor?.name || 'N/A',
      trial.companyName || 'Not Linked',
      trial.phase || trial.protocolSection?.designModule?.phases?.[0] || 'N/A',
      trial.status || trial.protocolSection?.statusModule?.overallStatus || 'N/A',
      trial.condition || trial.protocolSection?.conditionsModule?.conditions?.[0] || 'N/A',
      trial.startDate || trial.protocolSection?.statusModule?.startDateStruct?.date || 'N/A',
      trial.enrollment || trial.protocolSection?.designModule?.enrollmentInfo?.count || 'N/A'
    ]
  });
}

/**
 * Export news items to CSV
 */
export function exportNewsCSV(newsItems: any[]): void {
  exportToCSV({
    filename: 'competeai_news_feed',
    headers: [
      'Title',
      'Source',
      'Author',
      'Published Date',
      'Description',
      'URL'
    ],
    data: newsItems,
    dataMapper: (item) => [
      item.title || 'N/A',
      item.source?.name || item.source || 'N/A',
      item.author || 'N/A',
      item.publishedAt ? new Date(item.publishedAt).toLocaleString() : 'N/A',
      item.description || 'N/A',
      item.url || 'N/A'
    ]
  });
}

/**
 * Export alerts to CSV
 */
export function exportAlertsCSV(alerts: any[]): void {
  exportToCSV({
    filename: 'competeai_alerts',
    headers: [
      'Alert Name',
      'Type',
      'Keywords',
      'Companies',
      'Frequency',
      'Status',
      'Created Date'
    ],
    data: alerts,
    dataMapper: (alert) => [
      alert.name || alert.title || 'N/A',
      alert.type || 'N/A',
      Array.isArray(alert.keywords) ? alert.keywords.join('; ') : alert.keywords || 'N/A',
      Array.isArray(alert.companies) ? alert.companies.join('; ') : alert.companies || 'All',
      alert.frequency || 'Daily',
      alert.enabled ? 'Active' : 'Inactive',
      alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'N/A'
    ]
  });
}

