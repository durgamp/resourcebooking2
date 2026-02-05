
using Microsoft.AspNetCore.Mvc;
using ReactoPlan.Backend.Models;
using System.Collections.Generic;
using System.Linq;

namespace ReactoPlan.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private static List<Booking> _bookings = new(); // Mock database

        [HttpGet]
        public IEnumerable<Booking> Get() => _bookings;

        [HttpPost]
        public IActionResult Create([FromBody] Booking booking)
        {
            // Rule 7: Prevent more than 1 Actual log for overlapping intervals
            if (booking.Status == "Actual")
            {
                var exists = _bookings.Any(b => 
                    b.ReactorSerialNo == booking.ReactorSerialNo && 
                    b.Status == "Actual" &&
                    ((booking.StartDateTime >= b.StartDateTime && booking.StartDateTime < b.EndDateTime) || 
                     (booking.EndDateTime > b.StartDateTime && booking.EndDateTime <= b.EndDateTime)));
                
                if (exists) return BadRequest("Security Violation: An Actual Work Log already exists for this interval.");
            }

            _bookings.Add(booking);
            return Ok(booking);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {
            var booking = _bookings.FirstOrDefault(b => b.Id == id);
            if (booking == null) return NotFound();

            // Rule 9: Actual work log cannot be deleted
            if (booking.Status == "Actual") 
                return BadRequest("Actual logs are immutable and cannot be deleted for audit compliance.");

            _bookings.Remove(booking);
            return NoContent();
        }
    }
}
