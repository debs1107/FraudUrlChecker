using Microsoft.ML.Data;

namespace FraudDetectionAPI.MLModels
{
    public class PhishingModel
    {
        [LoadColumn(0)]
        public string? Url { get; set; }

        [LoadColumn(1)]
        public float RiskScore { get; set; }

    }

    public class PhishingPrediction
    {
        [ColumnName("Score")]
        public float RiskScore { get; set; }
    }

}
