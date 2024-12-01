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

// 지상국 안테나 위치
const groundStationPosition = Cesium.Cartesian3.fromDegrees(127.0, 37.5, 100); // 위도, 경도, 높이 (서울 기준)

// 안테나의 3D 모델 추가
const groundStation = viewer.entities.add({
  name: 'Ground Station Antenna',
  position: groundStationPosition,
  model: {
    uri: './antenna.glb', // 안테나 3D 모델 파일 경로
    scale: 1.0,
    minimumPixelSize: 52,
  },
});

// 수신 범위 표시 (구 형태)
const antennaCoverage = viewer.entities.add({
    name: 'Antenna Coverage',
    position: groundStationPosition,
    ellipsoid: {
      radii: new Cesium.Cartesian3(500000.0, 500000.0, 500000.0), // 수신 범위 반지름 (500km)
      material: Cesium.Color.BLUE.withAlpha(0.2), // 반투명 파란색
      outline: true, // 테두리 표시
      outlineColor: Cesium.Color.BLUE,
    },
});

viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(127.0, 37.5, 10000000)
});

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
