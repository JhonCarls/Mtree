class MTreeNode {
    constructor(parent = null) {
        this.parent = parent;
        this.children = [];
        this.entries = [];
        this.centroid = null;
        this.coverageRadius = 0;
    }
}

class MTree {
    constructor(maxNodeSize = 4) {
        this.root = new MTreeNode();
        this.maxNodeSize = maxNodeSize;
    }

    _euclideanDistance(point1, point2) {
        let sum = 0;
        for (let i = 0; i < point1.length; i++) {
            sum += Math.pow(point1[i] - point2[i], 2);
        }
        return Math.sqrt(sum);
    }

    _calculateCentroid(entries) {
        let centroid = entries[0].coords.map(() => 0);
        for (let entry of entries) {
            for (let i = 0; i < entry.coords.length; i++) {
                centroid[i] += entry.coords[i];
            }
        }
        for (let i = 0; i < centroid.length; i++) {
            centroid[i] /= entries.length;
        }
        return centroid;
    }

    add(dataPoint) {
        let node = this.root;
        while (node.children.length > 0) {
            node = this._chooseSubtree(node, dataPoint.coords);
        }
        node.entries.push(dataPoint);
        if (node.entries.length > this.maxNodeSize) {
            this._splitNode(node);
        } else {
            node.centroid = this._calculateCentroid(node.entries);
        }
    }

    _chooseSubtree(node, dataPoint) {
        let minDistance = Infinity;
        let chosenSubtree = null;
        for (let child of node.children) {
            let distance = this._euclideanDistance(child.centroid, dataPoint);
            if (distance < minDistance) {
                minDistance = distance;
                chosenSubtree = child;
            }
        }
        return chosenSubtree;
    }

    _splitNode(node) {
        let midpoint = Math.floor(node.entries.length / 2);
        let leftNode = new MTreeNode(node.parent);
        let rightNode = new MTreeNode(node.parent);

        node.entries.sort((a, b) => a.coords[0] - b.coords[0]);

        leftNode.entries = node.entries.slice(0, midpoint);
        rightNode.entries = node.entries.slice(midpoint);

        leftNode.centroid = this._calculateCentroid(leftNode.entries);
        rightNode.centroid = this._calculateCentroid(rightNode.entries);

        node.children.push(leftNode, rightNode);
        node.entries = [];
        node.centroid = null;
    }

    search(queryPoint, range) {
        let results = [];
        this._searchRecursive(this.root, queryPoint, range, results);
        return results;
    }

    _searchRecursive(node, queryPoint, range, results) {
        for (let entry of node.entries) {
            if (this._euclideanDistance(entry.coords, queryPoint) <= range) {
                results.push(entry);
            }
        }
        for (let child of node.children) {
            if (this._euclideanDistance(child.centroid, queryPoint) - child.coverageRadius <= range) {
                this._searchRecursive(child, queryPoint, range, results);
            }
        }
    }
}

// Datos de los Puntos de Interés
const pointsOfInterest = [
    { name: "Restaurant A", coords: [40.7128, -74.0060] },
    { name: "Park B", coords: [40.7158, -74.0020] },
    { name: "Store C", coords: [40.7120, -74.0100] },
    { name: "Museum D", coords: [40.7200, -74.0000] },
    { name: "Restaurant E", coords: [40.7250, -74.0050] },
];

// Construcción del M-tree
let mtree = new MTree(2);
pointsOfInterest.forEach(poi => mtree.add(poi));

// Búsqueda de Puntos de Interés Cercanos
document.getElementById('searchButton').addEventListener('click', () => {
    let lat = parseFloat(document.getElementById('latitude').value);
    let long = parseFloat(document.getElementById('longitude').value);
    let radius = parseFloat(document.getElementById('radius').value);

    if (!isNaN(lat) && !isNaN(long) && !isNaN(radius)) {
        let userLocation = [lat, long];
        let searchRadius = radius;

        let nearbyPOIs = mtree.search(userLocation, searchRadius);
        displayResults(nearbyPOIs);
    } else {
        alert('Por favor, ingresa valores válidos.');
    }
});

function displayResults(results) {
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (results.length > 0) {
        results.forEach(result => {
            let resultCard = document.createElement('div');
            resultCard.classList.add('card', 'result-card');
            resultCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${result.name}</h5>
                    <p class="card-text">Latitud: ${result.coords[0]}, Longitud: ${result.coords[1]}</p>
                </div>
            `;
            resultsDiv.appendChild(resultCard);
        });
    } else {
        resultsDiv.innerHTML = '<p>No se encontraron puntos de interés en el rango especificado.</p>';
    }
}
