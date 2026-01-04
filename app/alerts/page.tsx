'use client';

import { useState } from 'react';
import { FaBell, FaPlus, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

interface Alert {
  id: string;
  type: 'company' | 'therapy_area' | 'trial_phase' | 'keyword';
  value: string;
  enabled: boolean;
  createdAt: Date;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'company',
      value: 'Pfizer',
      enabled: true,
      createdAt: new Date(),
    },
    {
      id: '2',
      type: 'therapy_area',
      value: 'Oncology',
      enabled: true,
      createdAt: new Date(),
    },
    {
      id: '3',
      type: 'trial_phase',
      value: 'Phase 3',
      enabled: false,
      createdAt: new Date(),
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'company' as Alert['type'],
    value: '',
  });

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.value.trim()) return;

    const alert: Alert = {
      id: Date.now().toString(),
      type: newAlert.type,
      value: newAlert.value.trim(),
      enabled: true,
      createdAt: new Date(),
    };

    setAlerts([...alerts, alert]);
    setNewAlert({ type: 'company', value: '' });
    setShowAddForm(false);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(
      alerts.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const getAlertTypeLabel = (type: Alert['type']) => {
    switch (type) {
      case 'company':
        return 'Company';
      case 'therapy_area':
        return 'Therapy Area';
      case 'trial_phase':
        return 'Trial Phase';
      case 'keyword':
        return 'Keyword';
    }
  };

  const getAlertTypeBadgeColor = (type: Alert['type']) => {
    switch (type) {
      case 'company':
        return 'bg-blue-100 text-blue-800';
      case 'therapy_area':
        return 'bg-green-100 text-green-800';
      case 'trial_phase':
        return 'bg-purple-100 text-purple-800';
      case 'keyword':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <FaBell className="text-4xl text-blue-600 mr-4" />
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Alert Management</h1>
            <p className="text-gray-600 mt-1">
              Get notified about important pharma developments
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
        >
          <FaPlus className="mr-2" />
          New Alert
        </button>
      </div>

      {/* Add Alert Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Alert</h2>
          <form onSubmit={handleAddAlert}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Type
                </label>
                <select
                  value={newAlert.type}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, type: e.target.value as Alert['type'] })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="company">Company</option>
                  <option value="therapy_area">Therapy Area</option>
                  <option value="trial_phase">Trial Phase</option>
                  <option value="keyword">Keyword</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value
                </label>
                <input
                  type="text"
                  value={newAlert.value}
                  onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
                  placeholder={`Enter ${getAlertTypeLabel(newAlert.type).toLowerCase()}...`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Alert
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Alerts</p>
              <p className="text-3xl font-bold text-gray-900">{alerts.length}</p>
            </div>
            <FaBell className="text-4xl text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-3xl font-bold text-green-600">
                {alerts.filter((a) => a.enabled).length}
              </p>
            </div>
            <FaCheck className="text-4xl text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paused</p>
              <p className="text-3xl font-bold text-yellow-600">
                {alerts.filter((a) => !a.enabled).length}
              </p>
            </div>
            <FaTimes className="text-4xl text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Companies</p>
              <p className="text-3xl font-bold text-purple-600">
                {alerts.filter((a) => a.type === 'company').length}
              </p>
            </div>
            <FaBell className="text-4xl text-purple-500" />
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Your Alerts</h2>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-600">No alerts configured</p>
            <p className="text-sm text-gray-500 mt-2">
              Click &quot;New Alert&quot; to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !alert.enabled ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-grow">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        alert.enabled ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      <FaBell
                        className={`text-xl ${
                          alert.enabled ? 'text-green-600' : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getAlertTypeBadgeColor(
                            alert.type
                          )}`}
                        >
                          {getAlertTypeLabel(alert.type)}
                        </span>
                        {alert.enabled ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Paused
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{alert.value}</p>
                      <p className="text-sm text-gray-500">
                        Created {alert.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleAlert(alert.id)}
                      className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
                        alert.enabled
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {alert.enabled ? 'Pause' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Info */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-bold text-blue-900 mb-2">📬 How Alerts Work</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>
            <strong>Company Alerts:</strong> Get notified when there&apos;s news, trials, or
            regulatory updates for specific companies
          </li>
          <li>
            <strong>Therapy Area Alerts:</strong> Track developments in specific therapeutic
            areas like Oncology, Cardiology, etc.
          </li>
          <li>
            <strong>Trial Phase Alerts:</strong> Monitor when trials reach specific phases
            (Phase 1, 2, 3, or 4)
          </li>
          <li>
            <strong>Keyword Alerts:</strong> Custom alerts for any keyword or phrase you want
            to track
          </li>
        </ul>
        <p className="text-sm text-blue-800 mt-4">
          <strong>Note:</strong> Alert notifications will be implemented in the next phase with
          email/webhook integration.
        </p>
      </div>
    </div>
  );
}

