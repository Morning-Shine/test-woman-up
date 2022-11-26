export default function extractFileExtention(filename) {
  return filename.match(/\.[0-9a-z]{1,5}$/i)[0];
}
