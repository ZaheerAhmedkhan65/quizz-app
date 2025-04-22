document.addEventListener("DOMContentLoaded", () => {
    const graphContainer = document.getElementById("graph");
    const quizResultsData = JSON.parse(document.getElementById("quizz-results-data").textContent);
    let canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 240;
    canvas.style.backgroundColor = "white";
    graphContainer.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    // Draw X and Y Axes
    ctx.beginPath();
    ctx.moveTo(30, 20);   // Y-axis start
    ctx.lineTo(30, 220);  // Y-axis end
    ctx.moveTo(30, 220);  // X-axis start
    ctx.lineTo(220, 220); // X-axis end
    ctx.strokeStyle = "black";
    ctx.stroke();

    // X-axis label
    ctx.fillText("(Attempts)", 100, 238);

    // Y-axis label (Vertical)
    ctx.save();
    ctx.translate(10, 170);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("(Percentage Gained)", 0, 0);
    ctx.restore();

    // Draw green grid lines
    ctx.strokeStyle = "green";
    ctx.lineWidth = 0.5; // Thin lines

    // Vertical grid lines (from 1 to 5 on X-axis)
    for (let i = 1; i <= 5; i++) {
        let x = 30 + i * 35;
        ctx.beginPath();
        ctx.moveTo(x, 220);
        ctx.lineTo(x, 20); // Extend to the top
        ctx.stroke();
    }

    // Horizontal grid lines (from 0 to 100 in steps of 20)
    for (let i = 0; i <= 100; i += 20) {
        let y = 220 - (i * 2);
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(220, y); // Extend to the right
        ctx.stroke();
    }

    // Reset line width for the graph
    ctx.lineWidth = 2;

    // Draw X-axis points (1 to 5)
    ctx.strokeStyle = "black";
    for (let i = 1; i <= 5; i++) {
        let x = 30 + i * 35;
        ctx.fillText(i, x, 231);
        ctx.beginPath();
        ctx.moveTo(x, 220);
        ctx.lineTo(x, 215);
        ctx.stroke();
    }

    // Draw Y-axis points (0 to 100)
    for (let i = 0; i <= 100; i += 20) {
        let y = 220 - (i * 2);
        ctx.fillText(i, 12, y + 5);
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(35, y);
        ctx.stroke();
    }

    // Data points
    let dataPoints = [];
    quizResultsData.forEach(result => {
       dataPoints.push(((result.score /result.total_marks) * 100).toFixed(2));
    });

    if (dataPoints.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = "#8338EC";
        for (let i = 0; i < dataPoints.length; i++) {
            let x = 30 + (i + 1) * 35;
            let y = 220 - (dataPoints[i] * 2);
            if (i === 0)ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            ctx.lineCap = "round";
            ctx.lineJoin="round";
        }

        // Single point case
        if (dataPoints.length === 1) {
            let x = 30 + 1 * 35;
            let y = 220 - (dataPoints[0] * 2);
            ctx.moveTo(x - 5, y);
            ctx.lineTo(x + 5, y);
        }

        ctx.stroke();
    }

      // Draw green points at data points
      ctx.fillStyle = "green";
      for (let i = 0; i < dataPoints.length; i++) {
          let x = 30 + (i + 1) * 35;
          let y = 220 - (dataPoints[i] * 2);
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI); // Small circle at data point
          ctx.fill();
      }
});
