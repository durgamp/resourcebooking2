
using System;

namespace ReactoPlan.Backend.Models
{
    public class Reactor
    {
        public string SerialNo { get; set; } = string.Empty;
        public int MaxCapacityLiters { get; set; }
        public string CapacityRange { get; set; } = string.Empty;
        public string Moc { get; set; } = string.Empty;
        public string AgitatorType { get; set; } = string.Empty;
        public string PlantName { get; set; } = string.Empty;
        public string BlockName { get; set; } = string.Empty;
        public DateTime CommissionDate { get; set; }
        public string? Notes { get; set; }
    }
}
