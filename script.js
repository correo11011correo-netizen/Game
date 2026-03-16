const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = () => {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0,0,0);

  // Cámara con límites
  const camera = new BABYLON.ArcRotateCamera("camera", Math.PI/2, Math.PI/4, 20, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  camera.lowerBetaLimit = 0.1;
  camera.upperBetaLimit = Math.PI / 2.2;
  camera.lowerRadiusLimit = 5;
  camera.upperRadiusLimit = 50;

  // Luces
  const starLight = new BABYLON.PointLight("starLight", new BABYLON.Vector3(0,50,0), scene);
  starLight.intensity = 0.3;
  const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0,1,0), scene);
  hemiLight.intensity = 0.4;

  // Skybox estrellado (necesita 6 imágenes: stars_px.jpg, stars_nx.jpg, etc.)
  const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000}, scene);
  const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/stars", scene);
  skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new BABYLON.Color3(0,0,0);
  skyboxMaterial.specularColor = new BABYLON.Color3(0,0,0);
  skybox.material = skyboxMaterial;

  // Piso
  const ground = BABYLON.MeshBuilder.CreateGround("ground", {width:50, height:50}, scene);
  const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
  groundMaterial.diffuseColor = new BABYLON.Color3(0.2,0.2,0.2);
  ground.material = groundMaterial;

  // Jugador
  const player = BABYLON.MeshBuilder.CreateBox("player", {size:2}, scene);
  player.position.y = 1;

  // Joystick
  const joystick = document.getElementById("joystick");
  const stick = document.getElementById("stick");
  let centerX = joystick.offsetLeft + joystick.offsetWidth/2;
  let centerY = joystick.offsetTop + joystick.offsetHeight/2;
  let joyX = 0, joyY = 0;

  joystick.addEventListener("touchmove", e => {
    e.preventDefault();
    const touch = e.touches[0];
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    let dist = Math.sqrt(dx*dx + dy*dy);
    let maxDist = 70;
    if (dist > maxDist) { dx *= maxDist/dist; dy *= maxDist/dist; }
    stick.style.left = (dx + 60) + "px";
    stick.style.top = (dy + 60) + "px";
    joyX = dx/80;
    joyY = -dy/80;
  }, { passive:false });

  joystick.addEventListener("touchend", e => {
    e.preventDefault();
    stick.style.left = "60px"; stick.style.top = "60px";
    joyX = 0; joyY = 0;
  }, { passive:false });

  // Botón acción genérico
  let score = 0;
  const scoreDisplay = document.createElement("div");
  scoreDisplay.style.position = "absolute";
  scoreDisplay.style.top = "10px";
  scoreDisplay.style.left = "10px";
  scoreDisplay.style.color = "white";
  scoreDisplay.textContent = score;
  document.body.appendChild(scoreDisplay);

  document.getElementById("action").addEventListener("touchstart", e => {
    e.preventDefault();
    score++;
    scoreDisplay.textContent = score;
  }, { passive:false });

  // Botón de créditos
  const creditsBtn = document.getElementById("creditsBtn");
  const creditsPanel = document.getElementById("creditsPanel");

  creditsBtn.addEventListener("click", async () => {
    if (creditsPanel.style.display === "none") {
      try {
        const res = await fetch("comentarios.json");
        const data = await res.json();
        creditsPanel.innerHTML = "<h3>👥 Créditos</h3>";
        data.forEach(entry => {
          creditsPanel.innerHTML += `<p><strong>${entry.usuario}</strong>: ${entry.comentario}</p>`;
        });
        creditsPanel.style.display = "block";
      } catch (err) {
        creditsPanel.innerHTML = "<p>Error al cargar créditos</p>";
        creditsPanel.style.display = "block";
      }
    } else {
      creditsPanel.style.display = "none";
    }
  });

  // Loop de movimiento
  scene.onBeforeRenderObservable.add(() => {
    player.position.x += joyX * 0.1;
    player.position.z += joyY * 0.1;
    player.position.y = 1;
  });

  return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
