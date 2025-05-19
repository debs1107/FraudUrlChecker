// Models/AnalyticsModel.cs
using DatabaseFinalProject.Models;
using Microsoft.AspNetCore.Mvc;
using System;

namespace DatabaseFinalProject.Models
{
    public class AnalyticsModel
    {
        public string? Url { get; set; }
        public double RiskScore { get; set; }
        public string? Season { get; set; }
        public string? DeviceType { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}



