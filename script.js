const video = document.getElementById("video");
const moodText = document.getElementById("mood");

// Start camera and load models
async function start() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("./models");
  await faceapi.nets.faceExpressionNet.loadFromUri("./models");
  await faceapi.nets.ageGenderNet.loadFromUri("./models");

  // Access camera
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      alert("Camera access denied!");
      console.error(err);
    });
}

start();

// When video starts playing
video.addEventListener("play", () => {
  // Create canvas overlay
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.appendChild(canvas);

  // Make canvas style responsive
  canvas.style.position = "absolute";
  canvas.style.top = video.offsetTop + "px";
  canvas.style.left = video.offsetLeft + "px";
  canvas.style.width = video.offsetWidth + "px";
  canvas.style.height = video.offsetHeight + "px";

  // Adjust canvas size dynamically
  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  faceapi.matchDimensions(canvas, displaySize);

  // Detect faces continuously
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions()
      .withAgeAndGender();

    // Resize detection results to video size
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // Clear previous drawings
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    if (resizedDetections.length === 0) {
      moodText.innerText = "No face detected";
      return;
    }

    // Draw results
    resizedDetections.forEach(detection => {
      const box = detection.detection.box;
      const ctx = canvas.getContext("2d");

      // Draw face box
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Get top mood
      const mood = Object.keys(detection.expressions).reduce((a, b) =>
        detection.expressions[a] > detection.expressions[b] ? a : b
      );

      // Get rounded age
      const age = Math.round(detection.age);

      // Draw mood and age above box
      ctx.fillStyle = "#00FF00";
      ctx.font = "16px Arial";
      ctx.fillText(`Mood: ${mood}`, box.x, box.y - 20);
      ctx.fillText(`Age: ${age}`, box.x, box.y - 5);

      // Update HTML div as well
      moodText.innerText = `Mood: ${mood} | Age: ${age}`;
    });

  }, 500);
});
