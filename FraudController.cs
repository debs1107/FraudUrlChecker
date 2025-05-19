using FraudDetectionAPI.Data;
using FraudDetectionAPI.Models;
using FraudDetectionAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FraudDetectionAPI.Controllers
{
    [Route("api/fraud")]
    [ApiController]
    public class FraudController : ControllerBase
    {
        private readonly FraudDbContext _dbContext;
        private readonly MLService _mlService;

        public FraudController(FraudDbContext dbContext)
        {
            _dbContext = dbContext;
            _mlService = new MLService();
        }
        //example of controller triggering the ml.net. the inputted url is passed to the ml.net pipeline which has been trained via the csv file to mark the link as legitamate or suspicious.
        [HttpPost("predict")]
        public IActionResult PredictFraud([FromBody] FraudUrl urlData)
        {
            if (urlData == null || string.IsNullOrEmpty(urlData.Url))
                return BadRequest("Invalid or missing URL.");

            float riskScore = _mlService.PredictRisk(urlData.Url);

            var fraudUrl = new FraudUrl
            {
                Url = urlData.Url,
                RiskScore = riskScore
            };

            _dbContext.FraudUrls.Add(fraudUrl);
            _dbContext.SaveChanges();

            return Ok(new { Url = urlData.Url, RiskScore = riskScore });
        }

        [HttpGet("history")]
        public IActionResult GetHistory()
        {
            var data = _dbContext.FraudUrls.OrderByDescending(u => u.Id).ToList();
            return Ok(data);
        }
    }
}

