export class Labyrinth {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.reset();
    }

    reset() {
        // Initialize grid: 1 is wall, 0 is path
        this.grid = Array.from({ length: this.height }, () => Array(this.width).fill(1));
    }

    generate() {
        this.reset();
        
        const stack = [];
        const startX = 1;
        const startY = 1;
        
        this.grid[startY][startX] = 0;
        stack.push([startX, startY]);
        
        while (stack.length > 0) {
            const [x, y] = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(x, y);
            
            if (neighbors.length > 0) {
                const [nx, ny, dx, dy] = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.grid[y + dy][x + dx] = 0;
                this.grid[ny][nx] = 0;
                stack.push([nx, ny]);
            } else {
                stack.pop();
            }
        }

        // Set entrance and exit
        this.grid[1][0] = 0; // Entrance
        this.grid[this.height - 2][this.width - 1] = 0; // Exit
    }

    getUnvisitedNeighbors(x, y) {
        const neighbors = [];
        const dirs = [
            [0, -2, 0, -1], // Up
            [0, 2, 0, 1],   // Down
            [-2, 0, -1, 0], // Left
            [2, 0, 1, 0]    // Right
        ];
        
        for (const [dx2, dy2, dx1, dy1] of dirs) {
            const nx = x + dx2;
            const ny = y + dy2;
            
            if (nx > 0 && nx < this.width - 1 && ny > 0 && ny < this.height - 1 && this.grid[ny][nx] === 1) {
                neighbors.push([nx, ny, dx1, dy1]);
            }
        }
        
        return neighbors;
    }

    isWall(x, y) {
        const ix = Math.round(x);
        const iy = Math.round(y);
        if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) return true;
        return this.grid[iy][ix] === 1;
    }
}
