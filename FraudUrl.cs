using System.ComponentModel.DataAnnotations;

namespace FraudDetectionAPI.Models
{
    public class FraudUrl
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string? Url { get; set; }

        public float RiskScore { get; set; }
    }
}

