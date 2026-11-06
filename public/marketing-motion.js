import * as THREE from "three";

const canvas = document.getElementById("hero-three");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

if (canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 0.1, 11.5);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xdbe7df, 2.2));

    const light = new THREE.DirectionalLight(0xffffff, 1.8);
    light.position.set(-3, 4, 8);
    scene.add(light);

    const positions = [
      new THREE.Vector3(-4.1, -0.45, 0.1),
      new THREE.Vector3(-1.45, 0.25, -0.35),
      new THREE.Vector3(1.45, -0.18, -0.35),
      new THREE.Vector3(4.1, 0.45, 0.1),
    ];
    const palette = [0x75a789, 0x347865, 0x6f9278];
    const resources = { geometries: [], materials: [] };
    const keepGeometry = (geometry) => (resources.geometries.push(geometry), geometry);
    const keepMaterial = (material) => (resources.materials.push(material), material);

    const path = new THREE.CatmullRomCurve3(positions, false, "centripetal", 0.3);
    const track = new THREE.Mesh(
      keepGeometry(new THREE.TubeGeometry(path, 96, 0.012, 6, false)),
      keepMaterial(new THREE.MeshBasicMaterial({ color: 0x82aa8b, transparent: true, opacity: 0.55 })),
    );
    scene.add(track);

    const gates = positions.map((position, index) => {
      const group = new THREE.Group();
      group.position.copy(position);

      const torus = new THREE.Mesh(
        keepGeometry(new THREE.TorusGeometry(index === 1 || index === 2 ? 0.28 : 0.22, 0.018, 8, 48)),
        keepMaterial(new THREE.MeshStandardMaterial({
          color: palette[index % palette.length],
          roughness: 0.32,
          metalness: 0.12,
          emissive: palette[index % palette.length],
          emissiveIntensity: 0.13,
        })),
      );
      torus.rotation.y = index % 2 ? 0.55 : -0.55;

      const core = new THREE.Mesh(
        keepGeometry(new THREE.IcosahedronGeometry(0.07, 1)),
        keepMaterial(new THREE.MeshBasicMaterial({ color: palette[index % palette.length] })),
      );
      group.add(torus, core);
      scene.add(group);
      return group;
    });

    const packets = Array.from({ length: 6 }, (_, index) => {
      const packet = new THREE.Mesh(
        keepGeometry(new THREE.SphereGeometry(index % 2 ? 0.045 : 0.06, 16, 12)),
        keepMaterial(new THREE.MeshBasicMaterial({ color: index % 3 === 1 ? 0x347865 : 0x8eb797 })),
      );
      scene.add(packet);
      return { mesh: packet, offset: index / 6 };
    });

    function resize() {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 600 ? 13.5 : 11.5;
      camera.updateProjectionMatrix();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    let frame = 0;
    let startedAt = performance.now();

    function render(now) {
      const elapsed = (now - startedAt) / 1000;
      gates.forEach((gate, index) => {
        gate.rotation.y += 0.002 + index * 0.0002;
        gate.rotation.x = Math.sin(elapsed * 0.45 + index) * 0.12;
      });

      packets.forEach(({ mesh, offset }) => {
        const progress = ((elapsed * 0.075 + offset) % 1 + 1) % 1;
        path.getPointAt(progress, mesh.position);
        mesh.scale.setScalar(0.82 + Math.sin(elapsed * 2.2 + offset * 8) * 0.12);
      });

      renderer.render(scene, camera);
      if (!motionPreference.matches && document.visibilityState === "visible") {
        frame = requestAnimationFrame(render);
      }
    }

    function start() {
      cancelAnimationFrame(frame);
      startedAt = performance.now();
      frame = requestAnimationFrame(render);
    }

    function onMotionPreferenceChange() {
      cancelAnimationFrame(frame);
      if (motionPreference.matches) render(performance.now());
      else if (document.visibilityState === "visible") start();
    }

    function onVisibilityChange() {
      cancelAnimationFrame(frame);
      if (document.visibilityState === "visible" && !motionPreference.matches) start();
    }

    motionPreference.addEventListener("change", onMotionPreferenceChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    render(performance.now());

    window.addEventListener("pagehide", () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      motionPreference.removeEventListener("change", onMotionPreferenceChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      resources.geometries.forEach((geometry) => geometry.dispose());
      resources.materials.forEach((material) => material.dispose());
      renderer.dispose();
    }, { once: true });
  } catch {
    if (renderer) renderer.dispose();
    canvas.hidden = true;
  }
}
