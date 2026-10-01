const marksInputs = [
    document.getElementById('mark1'),
    document.getElementById('mark2'),
    document.getElementById('mark3'),
    document.getElementById('mark4'),
    document.getElementById('mark5')
];

const totalMarksEl = document.getElementById('totalMarks');
const averageMarksEl = document.getElementById('averageMarks');
const highestMarkEl = document.getElementById('highestMark');
const lowestMarkEl = document.getElementById('lowestMark');
const gradeValueEl = document.getElementById('gradeValue');
const calculateBtn = document.getElementById('calculateBtn');
const canvasContainer = document.getElementById('canvas3d');

function getMarks() {
    return marksInputs.map(input => {
        const value = Number(input.value);
        return Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;
    });
}

function calculateGrade(average) {
    if (average >= 90) return 'A';
    if (average >= 80) return 'B';
    if (average >= 70) return 'C';
    if (average >= 60) return 'D';
    return 'F';
}

function updateResults() {
    const marks = getMarks();
    const total = marks.reduce((sum, mark) => sum + mark, 0);
    const average = total / marks.length;
    const highest = Math.max(...marks);
    const lowest = Math.min(...marks);
    const grade = calculateGrade(average);

    totalMarksEl.textContent = total;
    averageMarksEl.textContent = average.toFixed(1);
    highestMarkEl.textContent = highest;
    lowestMarkEl.textContent = lowest;
    gradeValueEl.textContent = grade;

    render3DChart(marks);
}

function render3DChart(marks) {
    const parent = canvasContainer;
    parent.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1024);

    const camera = new THREE.PerspectiveCamera(50, parent.clientWidth / parent.clientHeight, 0.1, 1000);
    camera.position.set(0, 18, 32);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(parent.clientWidth, parent.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    parent.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x7bc8ff, 1.8);
    directionalLight.position.set(8, 12, 5);
    scene.add(directionalLight);

    const group = new THREE.Group();
    scene.add(group);

    const maxMark = 100;
    const barSpacing = 4.5;
    const barWidth = 3.2;

    // Create 3D bars
    marks.forEach((mark, index) => {
        const height = (mark / maxMark) * 16;
        const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(index / marks.length, 0.8, 0.6),
            emissive: new THREE.Color().setHSL(index / marks.length, 0.7, 0.2),
            metalness: 0.35,
            roughness: 0.25
        });

        const bar = new THREE.Mesh(geometry, material);
        bar.position.set((index - (marks.length - 1) / 2) * barSpacing, height / 2, 0);
        group.add(bar);
    });

    // Floor
    const floor = new THREE.Mesh(
        new THREE.CylinderGeometry(18, 18, 1.2, 64),
        new THREE.MeshStandardMaterial({
            color: 0x101b33,
            metalness: 0.5,
            roughness: 0.7,
            transparent: true,
            opacity: 0.9
        })
    );
    floor.position.y = -0.8;
    group.add(floor);

    // Decorative ring
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(11.5, 0.12, 16, 120),
        new THREE.MeshStandardMaterial({ color: 0x5ec6ff, emissive: 0x2c6cff, transparent: true, opacity: 0.8 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.1;
    scene.add(ring);

    // Interaction
    let autoRotate = true;
    let mouseX = 0;
    let mouseY = 0;

    parent.addEventListener('pointerdown', () => {
        autoRotate = false;
    });

    parent.addEventListener('pointermove', (event) => {
        if (!autoRotate) {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        }
    });

    parent.addEventListener('pointerleave', () => {
        autoRotate = true;
    });

    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);

        if (autoRotate) {
            group.rotation.y += 0.012;
            group.rotation.x = Math.sin(Date.now() * 0.001) * 0.18;
        } else {
            group.rotation.y = mouseX * 1.4;
            group.rotation.x = mouseY * 0.8 + 0.2;
        }

        renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = parent.clientWidth / parent.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(parent.clientWidth, parent.clientHeight);
    });
}

// Event listeners
calculateBtn.addEventListener('click', updateResults);
marksInputs.forEach(input => {
    input.addEventListener('change', updateResults);
});

// Initial render
updateResults();
