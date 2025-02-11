"use client";

import React, { useState } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import "./page.css";

const Page = () => {
  DataTable.use(DT);
  const [tableData] = useState([
    ["Tiger Nixon", "System Architect", "Edinburgh", "61", "2011/04/25", "$320,800", "t.nixon@datatables.net", "5421", "TN", "Active"],
    ["Garrett Winters", "Accountant", "Tokyo", "63", "2011/07/25", "$170,750", "g.winters@datatables.net", "8422", "GW", "Inactive"],
    ["Ashton Cox", "Junior Technical Author", "San Francisco", "66", "2009/01/12", "$86,000", "a.cox@datatables.net", "1562", "AC", "Active"],
    ["Cedric Kelly", "Senior Javascript Developer", "Edinburgh", "22", "2012/03/29", "$433,060", "c.kelly@datatables.net", "6224", "CK", "Active"],
    ["Airi Satou", "Accountant", "Tokyo", "33", "2008/11/28", "$162,700", "a.satou@datatables.net", "5407", "AS", "Inactive"],
    ["Brielle Williamson", "Integration Specialist", "New York", "61", "2012/12/02", "$372,000", "b.williamson@datatables.net", "4804", "BW", "Active"],
    ["Herrod Chandler", "Sales Assistant", "San Francisco", "59", "2012/08/06", "$137,500", "h.chandler@datatables.net", "9608", "HC", "Inactive"],
    ["Rhona Davidson", "Integration Specialist", "Tokyo", "55", "2010/10/14", "$327,900", "r.davidson@datatables.net", "6200", "RD", "Active"],
    ["Colleen Hurst", "Javascript Developer", "San Francisco", "39", "2009/09/15", "$205,500", "c.hurst@datatables.net", "2360", "CH", "Active"],
    ["Sonya Frost", "Software Engineer", "Edinburgh", "23", "2008/12/13", "$103,600", "s.frost@datatables.net", "1667", "SF", "Inactive"],
    ["Tiger Nixon", "System Architect", "Edinburgh", "61", "2011/04/25", "$320,800", "t.nixon@datatables.net", "5421", "TN", "Active"],
    ["Garrett Winters", "Accountant", "Tokyo", "63", "2011/07/25", "$170,750", "g.winters@datatables.net", "8422", "GW", "Inactive"],
    ["Ashton Cox", "Junior Technical Author", "San Francisco", "66", "2009/01/12", "$86,000", "a.cox@datatables.net", "1562", "AC", "Active"],
    ["Cedric Kelly", "Senior Javascript Developer", "Edinburgh", "22", "2012/03/29", "$433,060", "c.kelly@datatables.net", "6224", "CK", "Active"],
    ["Airi Satou", "Accountant", "Tokyo", "33", "2008/11/28", "$162,700", "a.satou@datatables.net", "5407", "AS", "Inactive"],
    ["Brielle Williamson", "Integration Specialist", "New York", "61", "2012/12/02", "$372,000", "b.williamson@datatables.net", "4804", "BW", "Active"],
    ["Herrod Chandler", "Sales Assistant", "San Francisco", "59", "2012/08/06", "$137,500", "h.chandler@datatables.net", "9608", "HC", "Inactive"],
    ["Rhona Davidson", "Integration Specialist", "Tokyo", "55", "2010/10/14", "$327,900", "r.davidson@datatables.net", "6200", "RD", "Active"],
    ["Colleen Hurst", "Javascript Developer", "San Francisco", "39", "2009/09/15", "$205,500", "c.hurst@datatables.net", "2360", "CH", "Active"],
    ["Sonya Frost", "Software Engineer", "Edinburgh", "23", "2008/12/13", "$103,600", "s.frost@datatables.net", "1667", "SF", "Inactive"],
  ]);

  return (
    <div className="datatable-container h-full">
      <div className="p-2 px-4 rounded-t-lg bg-[var(--bgBody)]">
        <h2 className="text-[16px] text-[white] font-bold">DataTable</h2>
      </div>
      <div className="table-wrapper p-4 bg-[var(--bgBody2)]" style={{borderBottomRightRadius: "10px", borderBottomLeftRadius: "10px", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
        <DataTable
          id="myTable"
          className="display dataTable"
          data={tableData}
          columns={[
            { title: "Name" },
            { title: "Position" },
            { title: "Office" },
            { title: "Age" },
            { title: "Start Date" },
            { title: "Salary" },
            { title: "Email" },
            { title: "Extn." },
            { title: "Initials" },
            { title: "Status" },
          ]}
          options={{
            scrollX: true,
            scrollY: "300px", 
            paging: true,
            searching: true, 
            info: true,
            autoWidth: true, 
          }}
        />
      </div> <br /> <br />
    </div>
  );
};

export default Page;
