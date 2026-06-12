interface StudentFeatureVector {
  tenthPercentage: number;
  twelfthPercentage: number;
  cgpa: number;
  entranceScore: number;
  attendancePercentage: number;
  extracurricularScore: number;
  prevAcademicPerformance: 'Excellent' | 'Good' | 'Average' | 'Poor';
  category: string;
}

export class LogisticRegressionModel {
  // Coefficients and bias trained on synthetic data
  private weights: number[] = [0, 0, 0, 0, 0, 0, 0, 0]; // 8 features
  private bias: number = 0;

  constructor() {
    this.trainOffline();
  }

  // Normalize features between 0 and 1 logically
  private extractFeatures(s: StudentFeatureVector): number[] {
    const tenthNorm = (s.tenthPercentage - 50) / 50;
    const twelfthNorm = (s.twelfthPercentage - 50) / 50;
    const cgpaNorm = (s.cgpa - 5) / 5;
    const entranceNorm = (s.entranceScore - 40) / 60;
    const attendanceNorm = (s.attendancePercentage - 60) / 40;
    const extracurricularNorm = s.extracurricularScore / 100;

    let perfNum = 0.4;
    if (s.prevAcademicPerformance === 'Excellent') perfNum = 1.0;
    else if (s.prevAcademicPerformance === 'Good') perfNum = 0.75;
    else if (s.prevAcademicPerformance === 'Average') perfNum = 0.5;
    else if (s.prevAcademicPerformance === 'Poor') perfNum = 0.2;

    let catNum = 0.5; // Baseline General/Open
    const lowerCategory = s.category.toLowerCase();
    if (lowerCategory.includes('obc')) catNum = 0.65;
    else if (lowerCategory.includes('sc')) catNum = 0.8;
    else if (lowerCategory.includes('st')) catNum = 0.9;

    return [
      tenthNorm,
      twelfthNorm,
      cgpaNorm,
      entranceNorm,
      attendanceNorm,
      extracurricularNorm,
      perfNum,
      catNum,
    ];
  }

  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-z));
  }

  // Train model using gradient descent on synthetic dataset to get realistic coefficients
  private trainOffline() {
    // Generate synthetic training set (1000 items)
    const dataset: { x: number[]; y: number }[] = [];
    const performances: ('Excellent' | 'Good' | 'Average' | 'Poor')[] = ['Excellent', 'Good', 'Average', 'Poor'];
    const categories = ['General', 'OBC', 'SC', 'ST'];

    // Fix random seed
    let rState = 42;
    const pseudoRandom = () => {
      const x = Math.sin(rState++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 1000; i++) {
      const tenth = 50 + pseudoRandom() * 50;
      const twelfth = 50 + pseudoRandom() * 50;
      const cgpa = 5 + pseudoRandom() * 5;
      const entrance = 40 + pseudoRandom() * 60;
      const attendance = 60 + pseudoRandom() * 40;
      const extracurricular = Math.floor(pseudoRandom() * 100);
      const prevPerf = performances[Math.floor(pseudoRandom() * 4)];
      const cat = categories[Math.floor(pseudoRandom() * 4)];

      const fVec = {
        tenthPercentage: tenth,
        twelfthPercentage: twelfth,
        cgpa,
        entranceScore: entrance,
        attendancePercentage: attendance,
        extracurricularScore: extracurricular,
        prevAcademicPerformance: prevPerf,
        category: cat,
      };

      const x = this.extractFeatures(fVec);

      // Define a custom logical "ground truth" separation plane
      // Scores >= 0.45 are eligible
      const logicalScore =
        0.15 * x[0] + // tenth
        0.25 * x[1] + // twelfth
        0.20 * x[2] + // cgpa
        0.25 * x[3] + // entrance
        0.05 * x[4] + // attendance
        0.10 * x[5] + // extracurricular
        0.05 * x[6];  // general performance

      const y = logicalScore > 0.35 ? 1 : 0;
      dataset.push({ x, y });
    }

    // Gradient descent training loop
    const epochs = 500;
    const learningRate = 0.1;
    this.weights = [0.1, 0.2, 0.1, 0.3, 0.05, 0.1, 0.1, 0.05];
    this.bias = -0.5;

    for (let e = 0; e < epochs; e++) {
      let dW = [0, 0, 0, 0, 0, 0, 0, 0];
      let dB = 0;

      for (const item of dataset) {
        let z = this.bias;
        for (let j = 0; j < 8; j++) {
          z += item.x[j] * this.weights[j];
        }
        const pred = this.sigmoid(z);
        const err = pred - item.y;

        for (let j = 0; j < 8; j++) {
          dW[j] += err * item.x[j];
        }
        dB += err;
      }

      // Update parameters
      for (let j = 0; j < 8; j++) {
        this.weights[j] -= (learningRate / dataset.length) * dW[j];
      }
      this.bias -= (learningRate / dataset.length) * dB;
    }

    console.log('Logistic Regression Model fully trained. Dynamic weights:', this.weights, 'Bias:', this.bias);
  }

  // Evaluates performance metrics on a synthetic validation sheet (Accuracy, Precision, Recall, F1)
  public evaluateModel() {
    const valSet: { x: number[]; y: number }[] = [];
    let rState = 2026;
    const pseudoRandom = () => {
      const x = Math.sin(rState++) * 10000;
      return x - Math.floor(x);
    };

    const performances: ('Excellent' | 'Good' | 'Average' | 'Poor')[] = ['Excellent', 'Good', 'Average', 'Poor'];
    const categories = ['General', 'OBC', 'SC', 'ST'];

    for (let i = 0; i < 200; i++) {
      const tenth = 50 + pseudoRandom() * 50;
      const twelfth = 50 + pseudoRandom() * 50;
      const cgpa = 5 + pseudoRandom() * 5;
      const entrance = 40 + pseudoRandom() * 60;
      const attendance = 60 + pseudoRandom() * 40;
      const extracurricular = Math.floor(pseudoRandom() * 100);
      const prevPerf = performances[Math.floor(pseudoRandom() * 4)];
      const cat = categories[Math.floor(pseudoRandom() * 4)];

      const fVec = {
        tenthPercentage: tenth,
        twelfthPercentage: twelfth,
        cgpa,
        entranceScore: entrance,
        attendancePercentage: attendance,
        extracurricularScore: extracurricular,
        prevAcademicPerformance: prevPerf,
        category: cat,
      };

      const x = this.extractFeatures(fVec);
      const logicalScore =
        0.15 * x[0] +
        0.25 * x[1] +
        0.20 * x[2] +
        0.25 * x[3] +
        0.05 * x[4] +
        0.10 * x[5] +
        0.05 * x[6];

      const y = logicalScore > 0.35 ? 1 : 0;
      valSet.push({ x, y });
    }

    let tp = 0, fp = 0, tn = 0, fn = 0;
    for (const item of valSet) {
      let z = this.bias;
      for (let j = 0; j < 8; j++) {
        z += item.x[j] * this.weights[j];
      }
      const predProb = this.sigmoid(z);
      const predY = predProb >= 0.5 ? 1 : 0;

      if (predY === 1 && item.y === 1) tp++;
      else if (predY === 1 && item.y === 0) fp++;
      else if (predY === 0 && item.y === 0) tn++;
      else if (predY === 0 && item.y === 1) fn++;
    }

    const accuracy = (tp + tn) / valSet.length;
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      accuracy,
      precision,
      recall,
      f1Score: f1,
      totalSamples: valSet.length,
    };
  }

  // Predict eligibility on input
  public predict(student: StudentFeatureVector) {
    const x = this.extractFeatures(student);
    let z = this.bias;
    for (let j = 0; j < 8; j++) {
      z += x[j] * this.weights[j];
    }
    const probabilityScore = this.sigmoid(z);
    return {
      eligible: probabilityScore >= 0.5,
      probabilityScore, // 0 to 1 value
    };
  }
}

export const admissionModel = new LogisticRegressionModel();
