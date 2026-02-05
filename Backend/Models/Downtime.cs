
using System;

namespace ReactoPlan.Backend.Models
{
    public class Downtime
    {
        public string Id { get; set; } = string.Empty;
        public string ReactorSerialNo { get; set; } = string.Empty;
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string UpdatedByEmail { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public bool IsCancelled { get; set; }
    }
}
