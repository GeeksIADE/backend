function calculateSSD(users, assignments, centers) {
    let sse = 0;
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const center = centers[assignments[i]];
        const distance = haversine(user, center);
        sse += distance * distance;
    }
    return sse;
}

function silhouetteScore(users, assignments, centers) {
    let totalScore = 0;
    for (let i = 0; i < users.length; i++) {
        const a = meanIntraClusterDistance(users[i], users, assignments, centers[assignments[i]]);
        const b = meanInterClusterDistance(users[i], users, assignments, centers);
        totalScore += (b - a) / Math.max(a, b);
    }
    return totalScore / users.length;
}

function meanIntraClusterDistance(user, users, assignments, center) {
    const sameClusterUsers = users.filter((_, j) => assignments[j] === assignments[users.indexOf(user)]);
    if (sameClusterUsers.length <= 1) return 0;  // a single point cluster has no intra-cluster distance
    return sameClusterUsers.reduce((total, u) => total + haversine2(user, u), 0) / (sameClusterUsers.length - 1);
}

function meanInterClusterDistance(user, users, assignments, centers) {
    const otherClusterUsers = users.filter((_, j) => assignments[j] !== assignments[users.indexOf(user)]);
    const otherClusters = [...new Set(otherClusterUsers.map(u => assignments[users.indexOf(u)]))];
    const meanDistances = otherClusters.map(c => {
        const clusterUsers = users.filter((_, j) => assignments[j] === c);
        return clusterUsers.reduce((total, u) => total + haversine2(user, u), 0) / clusterUsers.length;
    });
    return Math.min(...meanDistances);
}

function findBestK(users, maxK) {
    let bestK = 2;
    let maxSilhouette = -Infinity;
    for (let k = 3; k <= maxK; k++) {
        const assignments = kCluster(users, k);
        const centers = calculateCenters(users, assignments);
        const silhouette = silhouetteScore(users, assignments, centers);
        if (silhouette > maxSilhouette) {
            maxSilhouette = silhouette;
            bestK = k;
        }
    }
    return bestK;
}

function calculateCenters(users, assignments) {
    return assignments.map((_, i) => {
        const clusterUsers = users.filter((_, j) => assignments[j] === i);
        return {
            latitude: clusterUsers.reduce((total, user) => total + user.user_latitude, 0) / clusterUsers.length,
            longitude: clusterUsers.reduce((total, user) => total + user.user_longitude, 0) / clusterUsers.length,
        };
    });
}
// function findBestK(users, maxK) {
//     const sseValues = [];
//     for (let k = 1; k <= maxK; k++) {
//         const assignments = kCluster(users, k);
//         const centers = assignments.map((_, i) => {
//             const clusterUsers = users.filter((_, j) => assignments[j] === i);
//             return {
//                 latitude: clusterUsers.reduce((total, user) => total + user.user_latitude, 0) / clusterUsers.length,
//                 longitude: clusterUsers.reduce((total, user) => total + user.user_longitude, 0) / clusterUsers.length,
//             };
//         });
//         const sse = calculateSSD(users, assignments, centers);
//         sseValues.push(sse);
//     }
//     let elbowPoint = 1;
//     let maxDecrease = 0;
//     for (let i = 1; i < sseValues.length; i++) {
//         const decrease = sseValues[i - 1] - sseValues[i];
//         if (decrease > maxDecrease) {
//             maxDecrease = decrease;
//             elbowPoint = i;
//         }
//     }
//     return elbowPoint + 1;
// }

function toRad(deg) {
    return deg * Math.PI / 180;
}

function haversine(point1, point2) {
    const R = 6371;
    const lat1 = toRad(point1.user_latitude);
    const lon1 = toRad(point1.user_longitude);
    const lat2 = toRad(point2.latitude);
    const lon2 = toRad(point2.longitude);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function haversine2(point1, point2) {
    const R = 6371;
    const lat1 = toRad(point1.user_latitude);
    const lon1 = toRad(point1.user_longitude);
    const lat2 = toRad(point2.user_latitude);
    const lon2 = toRad(point2.user_longitude);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function kCluster(users, k) {
    let centers = users.map(user => ({
        latitude: user.user_latitude,
        longitude: user.user_longitude
    })).sort(() => Math.random() - 0.5).slice(0, k);

    let assignments = [];
    let oldAssignments;

    while (true) {
        oldAssignments = assignments;
        assignments = users.map(user => {
            return centers.reduce(
                (min, center, index) => {
                    const d = haversine(user, center);
                    if (d < min.distance) {
                        min.cluster = index;
                        min.distance = d;
                    }
                    return min;
                },
                { cluster: null, distance: Infinity }
            ).cluster;
        });
        const newCenters = centers.map((_, i) => {
            const clusterUsers = users.filter((_, j) => assignments[j] === i);
            if (clusterUsers.length === 0) {
                return users[Math.floor(Math.random() * users.length)];
            }
            return {
                latitude: clusterUsers.reduce((total, user) => total + user.user_latitude, 0) / clusterUsers.length,
                longitude: clusterUsers.reduce((total, user) => total + user.user_longitude, 0) / clusterUsers.length,
            };
        });
        if (oldAssignments.every((old, i) => old === assignments[i])) {
            break;
        }
        centers = newCenters;
    }
    return assignments;
}

module.exports = { haversine, kCluster, findBestK };