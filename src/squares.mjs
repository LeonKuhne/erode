

export class MarchingSquares {
  constructor(size) {
    // Define corner points
    //  6 5 4
    //  7   3
    //  0 1 2
    const points = [
      [0, 1],   
      [0.5, 1], 
      [1, 1],   
      [1, 0.5], 
      [1, 0],   
      [0.5, 0], 
      [0, 0],   
      [0, 0.5], 
    ]

    // Define lookup table for marching squares
    // Each combination corresponds to a different polygon
    const polygons = [
      [],
      [[0, 1, 7]],
      [[1, 2, 3]],
      [[7, 0, 2, 3]],
      [[3, 4, 5]],
      [[0, 1, 3, 4, 5, 7]],
      [[1, 2, 4, 5]],
      [[0, 2, 4, 5, 7]],
      [[5, 6, 7]],
      [[0, 1, 5, 6]],
      [[1, 2, 3, 5, 6, 7]],
      [[0, 2, 3, 5, 6]],
      [[3, 4, 6, 7]],
      [[0, 1, 3, 4, 6]],
      [[1, 2, 4, 6, 7]],
      [[0, 2, 4, 6]],
    ];

    // Generate pre-rendered image URLs
    const imageUrls = polygons.map((polygonPoints) => {
      // Create a new canvas
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Draw each polygon
      polygonPoints.forEach((pointsInPolygon) => {
        ctx.fillStyle = "white"
        ctx.beginPath();
        pointsInPolygon.forEach((pointIndex, index) => {
          const [x, y] = points[pointIndex];
          if (index === 0) {
            ctx.moveTo(x * size, y * size);
          } else {
            ctx.lineTo(x * size, y * size);
          }
        });
        ctx.closePath();
        ctx.fill();
      });

      // Convert canvas to image URL
      return canvas.toDataURL();
    });

    // Create Image objects
    this.shapes = imageUrls.map((url) => {
      const img = new Image();
      img.src = url;
      return img;
    });
  }
}