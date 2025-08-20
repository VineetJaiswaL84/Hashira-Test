const fs = require('fs');
const readline = require('readline');

function decodeValue(baseStr, valueStr) {
    const base = parseInt(baseStr, 10);
    if (base <= 36) {
        return BigInt(parseInt(valueStr, base));
    } else {
        throw new Error('Base not supported');
    }
}

function lagrangeConstant(points) {
    let total = BigInt(0);
    const n = points.length;
    
    for (let i = 0; i < n; i++) {
        const x_i = BigInt(points[i].x);
        const y_i = points[i].y;
        
        let numerator = BigInt(1);
        let denominator = BigInt(1);
        
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                const x_j = BigInt(points[j].x);
                numerator *= (-x_j);
                denominator *= (x_i - x_j);
            }
        }
        
        const l_i = numerator / denominator;
        total += y_i * l_i;
    }
    
    return total;
}

async function main() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const filename = await new Promise(resolve => rl.question("Enter test case JSON filename: ", resolve));
    rl.close();

    let data;
    try {
        data = JSON.parse(fs.readFileSync(filename, 'utf-8'));
    } catch (e) {
        console.log("Error reading JSON file:", e.message);
        return;
    }

    const n = parseInt(data.keys.n);
    const k = parseInt(data.keys.k);

    console.log(`Processing test case with n=${n}, k=${k}`);

    let points = [];
    const keysSorted = Object.keys(data)
        .filter(key => key !== 'keys')
        .sort((a, b) => parseInt(a) - parseInt(b));

    console.log(`Using first ${k} points from the sorted keys: ${keysSorted.slice(0, k).join(', ')}`);

    for (let i = 0; i < k; i++) {
        const key = keysSorted[i];
        const entry = data[key];
        const x = parseInt(key, 10);
        const y = decodeValue(entry.base, entry.value);
        points.push({ x, y });
        
        console.log(`Point ${i+1}: x=${x}, y=${y} (decoded from base ${entry.base}, value "${entry.value}")`);
    }

    const secretC = lagrangeConstant(points);
    console.log("\nSecret constant c:", secretC.toString());
}

main().catch(console.error);
