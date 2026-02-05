
using System;

namespace ReactoPlan.Backend.Models
{
    public class Booking
    {
        public string Id { get; set; } = string.Empty;
        public string ReactorSerialNo { get; set; } = string.Empty;
        public string Team { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string Stage { get; set; } = string.Empty;
        public string BatchNumber { get; set; } = string.Empty;
        public string Operation { get; set; } = string.Empty;
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public string Status { get; set; } = string.Empty; // Proposed or Actual
        public string RequestedByEmail { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
