/**
 * Test Hugging Face Embeddings
 * Quick test to verify the API works before generating all embeddings
 */

import { HfInference } from '@huggingface/inference';

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const HF_MODEL = 'sentence-transformers/all-mpnet-base-v2';

// Initialize Hugging Face client
const hf = new HfInference(HF_API_KEY || undefined);

async function testEmbedding() {
  console.log('🧪 Testing Hugging Face Embedding API...\n');
  console.log(`Model: ${HF_MODEL}`);
  console.log(`API Key: ${HF_API_KEY ? '✅ Provided' : '⚠️  Not provided (using free tier)'}\n`);

  const testText = "Breast Cancer is a type of oncology indication with multiple clinical trials.";

  try {
    console.log(`📤 Sending test request...`);
    console.log(`Text: "${testText}"\n`);

    const embedding = await hf.featureExtraction({
      model: HF_MODEL,
      inputs: testText,
    });

    // Handle response format
    let embeddingArray: number[];
    if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
      embeddingArray = embedding[0] as number[];
    } else if (Array.isArray(embedding)) {
      embeddingArray = embedding as number[];
    } else {
      console.error('❌ Unexpected response format:', embedding);
      return;
    }

    console.log('✅ Success!');
    console.log(`📊 Embedding dimensions: ${embeddingArray.length}`);
    console.log(`📊 First 5 values: [${embeddingArray.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    console.log(`📊 Min value: ${Math.min(...embeddingArray).toFixed(4)}`);
    console.log(`📊 Max value: ${Math.max(...embeddingArray).toFixed(4)}`);
    console.log(`\n🎉 Hugging Face API is working! Ready to generate embeddings.`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

testEmbedding();

