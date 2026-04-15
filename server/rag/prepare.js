import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HF_API_KEY,
  model: "BAAI/bge-large-en-v1.5",
  provider: "hf-inference", 
});
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME);

export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex,
  maxConcurrency: 5,
});

export async function indexTheDocument(filepath) {
  const loader = new PDFLoader(filepath, { splitPages: false });
  const doc = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });
  const texts = await splitter.splitText(doc[0].pageContent);

  const documents = texts.map((chunk) => {
    return {
      pageContent: chunk,
      metadata: doc[0].metadata,
    };
  });
  await vectorStore.addDocuments(documents);
}
