using Microsoft.ML;
using Microsoft.ML.Data;
using FraudDetectionAPI.MLModels;
using System;
using System.Collections.Generic;
using System.IO;

namespace FraudDetectionAPI.Services
{
    public class MLService
    {
        private readonly MLContext _mlContext;
        private readonly ITransformer _model;
        private readonly PredictionEngine<PhishingModel, PhishingPrediction> _predictionEngine;

        public MLService()
        {
            _mlContext = new MLContext();
            var dataPath = "./Data/linksfile.csv"; // Path to CSV file
            var data = LoadDataFromCsv(dataPath);
            var dataView = _mlContext.Data.LoadFromEnumerable(data);

            // ✅ Fixing the ML Pipeline
            var pipeline = _mlContext.Transforms.Text.FeaturizeText("Features", nameof(PhishingModel.Url))
                .Append(_mlContext.Transforms.CopyColumns("Label", nameof(PhishingModel.RiskScore)))
                // This is the actual use of the FastTree model.
                // It creates and fits a FastTree regression model using the dataset from the CSV file (linksfile.csv),
                // which contains the real URLs and associated risk scores
                .Append(_mlContext.Regression.Trainers.FastTree());

            _model = pipeline.Fit(dataView);
            _predictionEngine = _mlContext.Model.CreatePredictionEngine<PhishingModel, PhishingPrediction>(_model);

            // ✅ Log Sample Predictions to Debug
            Console.WriteLine("🔍 Model Training Complete! Sample Predictions:");
            foreach (var item in data)
            {
                float predictedRisk = PredictRisk(item.Url);
                Console.WriteLine($"URL: {item.Url} → Predicted Risk Score: {predictedRisk}");
            }
        }

        private List<PhishingModel> LoadDataFromCsv(string filePath)
        {
            var data = new List<PhishingModel>();
            if (!File.Exists(filePath))
            {
                Console.WriteLine("❌ CSV file not found!");
                return data;
            }

            using (var reader = new StreamReader(filePath))
            {
                string? line;
                bool isHeader = true;
                while ((line = reader.ReadLine()) != null)
                {
                    if (isHeader)
                    {
                        isHeader = false;
                        continue; // Skip header row
                    }

                    var values = line.Split(',');
                    if (values.Length == 2 && float.TryParse(values[1], out float riskScore))
                    {
                        data.Add(new PhishingModel { Url = values[0], RiskScore = riskScore });
                    }
                }
            }

            return data;
        }
       
        public float PredictRisk(string url)
        {
            //PredictRisk helps performs a real-time prediction.
            var prediction = _predictionEngine.Predict(new PhishingModel { Url = url });

            // ✅ Log predictions for debugging
            Console.WriteLine($"[ML Prediction] URL: {url} → Predicted Risk Score: {prediction.RiskScore}");

            return prediction.RiskScore;
        }
    }
}
