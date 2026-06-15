// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

// import { Pinecone } from "@pinecone-database/pinecone";
// import { PineconeStore } from "@langchain/pinecone";
// const embeddings = new HuggingFaceInferenceEmbeddings({
//   apiKey: process.env.HF_API_KEY,
//   model: "BAAI/bge-large-en-v1.5",
//   provider: "hf-inference",
// });
// const pinecone = new Pinecone({
//   apiKey: process.env.PINECONE_API_KEY,
// });

// const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME);

// export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
//   pineconeIndex,
//   maxConcurrency: 5,
// });

// export async function indexTheDocument(filepath) {
//   const loader = new PDFLoader(filepath, { splitPages: false });
//   const doc = await loader.load();

//   const splitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 500,
//     chunkOverlap: 100,
//   });
//   const texts = await splitter.splitText(doc[0].pageContent);

//   const documents = texts.map((chunk) => {
//     return {
//       pageContent: chunk,
//       metadata: doc[0].metadata,
//     };
//   });
//   await vectorStore.addDocuments(documents);
// }

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import path from "path";

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

function getLoader(filepath) {
  const ext = path.extname(filepath).toLowerCase();

  switch (ext) {
    case ".pdf":
      return new PDFLoader(filepath, { splitPages: false });
    case ".docx":
    case ".doc":
      return new DocxLoader(filepath);
    default:
      throw new Error(
        `Unsupported file type: "${ext}". Supported types: .pdf, .docx, .doc`,
      );
  }
}

export async function indexTheDocument(filepath) {
  const loader = getLoader(filepath);
  const doc = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const texts = await splitter.splitText(doc[0].pageContent);

  const documents = texts.map((chunk) => ({
    pageContent: chunk,
    metadata: doc[0].metadata,
  }));

  await vectorStore.addDocuments(documents);
}
