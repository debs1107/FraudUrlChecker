using Microsoft.AspNetCore.Mvc;
using DatabaseFinalProject.Models;
using System.Collections.Generic;
using System;

namespace DatabaseFinalProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private static readonly List<AnalyticsModel> _analyticsStore = new();

        [HttpPost("log")]
        public IActionResult LogAnalytics([FromBody] AnalyticsModel model)
        {
            if (model == null || string.IsNullOrEmpty(model.Url))
                return BadRequest("Invalid data");

            _analyticsStore.Add(model);
            Console.WriteLine($"[Analytics] {model.Url} | Season: {model.Season} | Risk: {model.RiskScore} | Time: {model.Timestamp}");
            return Ok(new { message = "Analytics logged successfully" });
        }

        [HttpGet("all")]
        public IActionResult GetAllAnalytics()
        {
            return Ok(_analyticsStore);
        }
    }
}
