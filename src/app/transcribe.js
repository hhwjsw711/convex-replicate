import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({
  apiKey: '9f78425869744eee856d5bbcd4a1fe7b', // 请使用您自己的API密钥
});

const FILE_URL = 'https://aware-gnu-19.convex.cloud/api/storage/e928e45e-610e-4340-a7e7-6265c1105d54';

const data = {
  audio: FILE_URL
}

const run = async () => {
  try {
    console.log('开始转录...');
    const transcript = await client.transcripts.transcribe(data);
    console.log('转录完成。结果:');
    console.log(transcript.words);
  } catch (error) {
    console.error('转录出错:', error);
  }
};

run();