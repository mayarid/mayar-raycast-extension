import { MenuBarExtra, getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

interface Balance {
  balanceActive: number;
  balancePending: number;
  balance: number;
}

interface Data {
  statusCode: number;
  messages: string;
  data: Balance;
}

interface DataTrx {
  statusCode: number,
  messages: string,
  hasMore: boolean,
  pageCount: number,
  pageSize: number,
  page: number,
  data: object
}

function UnixTime( unixTime : number): string {
  const formattedDate = moment(unixTime).format("D MMM HH:mm");
  return formattedDate;
}

function formatRp(value: number): string {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  });
  return formatter.format(value);
}

const fetchData = async (token: string): Promise<Data[]> => {
  const response = await axios.get<Data[]>("https://api.mayar.id/hl/v1/balance", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const fetchDataTrx = async (token: string): Promise<DataTrx[]> => {
  const response = await axios.get<DataTrx[]>("https://api.mayar.id/hl/v1/transactions?pageSize=10&page=1", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export default function Command() {
  const preferences = getPreferenceValues();
  const [data, setData] = useState<any | null>(null);
  const [dataTrx, setDataTrx] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  console.log("PREF:", preferences);

  useEffect(() => {
    const token = preferences["required-password"];
    fetchData(token)
      .then((result) => {
        console.log("DATA:", result)
        setData(result);

        fetchDataTrx(token)
          .then((result) => {
            console.log("DATATRX:", result)
            setDataTrx(result["data"]);
            setLoading(false);
            console.log("DATATRX----DATA:", result["data"][0].customer.email)
          })
          .catch((error) => {
            setLoading(false);
          });
      })
      .catch((error) => {
        setLoading(false);
      });
  }, []);

  return (
    <MenuBarExtra isLoading={loading} icon="https://pub-e4d31eae5d834409a04a5f020a42923e.r2.dev/mayar-favicon-black.png" tooltip="Mayar Balance and Recent Transaction">
      <MenuBarExtra.Item title="Mayar Balance" />
      <MenuBarExtra.Item
        icon={{ source: "wallet.png" }}
        title={"Total: " + formatRp(data?.data.balance)}
        onAction={() => {
          console.log("balance clicked");
        }}
      />
      <MenuBarExtra.Item
        icon={{ source: "active.png" }}
        title={"Active: " + formatRp(data?.data.balanceActive)}
        onAction={() => {
          console.log("balance active clicked");
        }}
      />
      <MenuBarExtra.Item
        icon={{ source: "pending.png" }}
        title={"Pending: " + formatRp(data?.data.balancePending)}
        onAction={() => {
          console.log("balance pending clicked");
        }}
      />
      <MenuBarExtra.Item title="Recent Transactions" />
      {
        (dataTrx || []).map(trx =>(
          <MenuBarExtra.Item
            key={trx.id}
            title={UnixTime(trx.createdAt) + " - " + formatRp(trx.credit) + " - " + trx?.customer?.email}
            onAction={() => {
              console.log("transaction clicked");
            }}
          />
        ))
      }
    </MenuBarExtra>
  );
}