import React from "react";

type Props = {
  data: any;
  filename?: string; 
};

const DynamicDataDisplay: React.FC<Props> = ({ data, filename }) => {
  return (
    <div className="mt-4 border p-4 rounded shadow-sm bg-white">
      {filename && <h2 className="text-lg font-bold mb-2">{filename}</h2>}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <tbody>
            {data &&
              Object.entries(data).map(([key, value]) => (
                <tr key={key} className="border-b">
                  <td className="px-2 py-1 font-semibold">{key}</td>
                  <td className="px-2 py-1">{JSON.stringify(value)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DynamicDataDisplay;
