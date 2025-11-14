const fs = require("fs");
const csv = require("csv-parser");
function ceilHours(h) {
    return Math.ceil(h);
}
function calculate_charges(durationHours) {
    if (durationHours <= 0) 
          return { charge: 0, error: true };
    const hours = ceilHours(durationHours);
    const fullDays = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    let charge = fullDays * 10.0;
    if (fullDays >= 3) {     
           return { charge: 0, error: true };
    }
    if (remainingHours <= 3) {
        charge += 2.0;
    } else {
        charge += 2.0 + (remainingHours - 3) * 0.5;
    }
    if (charge - fullDays * 10.0 > 10.0) {
        charge = (fullDays + 1) * 10.0;
    }

    return { charge: charge, error: false };
}

function hoursDiff(start, end) {
    return (end - start) / (1000 * 60 * 60);
}

const results = [];
createReadStream("yesterday.csv")
  .pipe(csv())
  .on("data", (row) => {
      const id = row.customer_id;
      const entry = new Date(row.entry_timestamp);
      const exit = new Date(row.exit_timestamp);

      let duration = hoursDiff(entry, exit);

      let errorFlag = false;
      let charge = 0;

      if (isNaN(entry) || isNaN(exit) || exit <= entry) {
          errorFlag = true;
      } else {
          const calc = calculate_charges(duration);
          charge = calc.charge;
          errorFlag = calc.error;
      }

      results.push({
          customer_id: id,
          duration_hours: Math.ceil(duration > 0 ? duration : 0),
          charge: charge.toFixed(2),
          error_flag: errorFlag ? "YES" : "NO"
      });
  })
  .on("end", () => {
      const output = ["customer_id,duration_hours,charge,error_flag"];
      results.forEach(r => {
          output.push(`${r.customer_id},${r.duration_hours},${r.charge},${r.error_flag}`);
      });
      fs.writeFileSync("charges_report.csv", output.join("\n"));
      let totalReceipts = 0;
      let maxCount = 0; 
      let longest = 0;
      let longestIDs = [];

      results.forEach(r => {
          const charge = parseFloat(r.charge);
          const hrs = r.duration_hours;

          if (r.error_flag === "NO") {
              totalReceipts += charge;
              if (charge >= 10.0) maxCount++;

              if (hrs > longest) {
                  longest = hrs;
                  longestIDs = [r.customer_id];
              } else if (hrs === longest) {
                  longestIDs.push(r.customer_id);
              }
          }
      });

      console.log("Total Receipts:", totalReceipts.toFixed(2));
      console.log("Customers charged daily max:", maxCount);
      console.log("Average Charge:", (totalReceipts / results.length).toFixed(2));
      console.log("Longest stay hour(s):", longest);
      console.log("Customer IDs with longest stay:", longestIDs.join(", "));
  });