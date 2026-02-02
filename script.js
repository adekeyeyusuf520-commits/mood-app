const video = document.getElementById("video");
const moodText = document.getElementById("mood");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("models"),
  faceapi.nets.faceExpressionNet.loadFromUri("models")
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      alert("Camera access denied!");
      console.log(err);
    });
}

video.addEventListener("play", () => {
  setInterval(async () => {

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detection) {
      const expressions = detection.expressions;
      const mood = getTopEmotion(expressions);
      moodText.innerText = "Mood: " + mood;
    } else {
      moodText.innerText = "No face detected";
    }

  }, 500);
});

function getTopEmotion(expressions) {
  return Object.keys(expressions)
    .reduce((a, b) => expressions[a] > expressions[b] ? a : b);
}