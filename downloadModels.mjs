import fs from 'fs';
import https from 'https';
import path from 'path';

const models = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

const basePath = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/';
const dir = path.join('c:', 'Users', '91903', 'OneDrive', 'Desktop', '4-2 project', 'public', 'models');

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

(async () => {
  for (const model of models) {
    console.log('Downloading ' + model);
    await download(basePath + model, path.join(dir, model));
  }
  console.log('All models downloaded successfully!');
})();
