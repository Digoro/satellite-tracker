Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNTEzYzZjMy1lY2NhLTQ1ZDctODdiNS04NGFmYTg3NjQ3MzciLCJpZCI6MjU5MTcwLCJpYXQiOjE3MzMwMTYxNDV9.UcTA48QcuJupfSTHqTWUfDjp8FZT0YORfNTsUdAl_KA';

const viewer = new Cesium.Viewer('cesiumContainer', {
    terrain: Cesium.Terrain.fromWorldTerrain(),
    navigationHelpButton: true, // 내비게이션 도움말 버튼 표시
    sceneModePicker: true, // 장면 모드 선택기 표시
    homeButton: true, // 홈 버튼 표시
    geocoder: true, // 주소 검색 표시
    infoBox: true, // 정보 박스 표시
    selectionIndicator: true, // 선택 지시기 표시
    timeline: true, // 타임라인 표시
    animation: true, // 애니메이션 표시
    fullscreenButton: true, // 전체화면 버튼 표시
});

// viewer.camera.setView({
//     destination: Cesium.Cartesian3.fromDegrees(34.5, 128.9, 1500),
// });

document.getElementById('btn').addEventListener('click', ()=> {
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(126.9256608, 37.4824289, 2000),
        orientation: {
            heading: Cesium.Math.toRadians(90), // 방향
            pitch: Cesium.Math.toRadians(-30), // 경사
            roll: 0 // 회전
        }
    });
})

const socket = new WebSocket('ws://localhost:3000');

const satelliteEntities = {};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    const { id, position } = data;
    const pathPosition = Cesium.Cartesian3.fromDegrees(position.lon, position.lat, position.alt * 1000)
    if (satelliteEntities[id]) {
        updateSatellitePath(id, pathPosition);
    } else {
        createSatelliteEntity(id, pathPosition);
    }
};

function updateSatellitePath(id, pathPosition) {
    const entity = satelliteEntities[id];
    if (!entity) return;
    // const currentPositions = entity.polyline.positions.getValue(viewer.clock.currentTime);
    // entity.polyline.positions = new Cesium.ConstantProperty([...currentPositions, pathPosition]);
    // currentPositions.push(pathPosition)
    const positions = entity.positionsArray;
    positions.push(pathPosition); // 새로운 위치 추가
    entity.position = pathPosition;
}

function createSatelliteEntity(id, pathPosition) {
    const positionsArray = [pathPosition];
    satelliteEntities[id] = viewer.entities.add({
        id: id,
        name: id,
        positionsArray: positionsArray,
        polyline: {
            // positions: [pathPosition],
            positions: new Cesium.CallbackProperty(() => positionsArray, false), // 동적 업데이트
            width: 2,
            material: Cesium.Color.YELLOW,
        },
        model: {
            uri: './satellite.glb', 
            scale: 1.0, 
            minimumPixelSize: 128, 
            maximumScale: 20000,
        },
        position: pathPosition
    });
}
