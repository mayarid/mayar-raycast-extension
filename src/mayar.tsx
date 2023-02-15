import { List, getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";
import axios from 'axios';

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

const fetchData = async (token: string): Promise<Data[]> => {
  const response = await axios.get<Data[]>('https://api.mayar.id/hl/v1/balance', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export default function Command() {
  const preferences = getPreferenceValues();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Typed preferences:", preferences);
    console.log("APIKEY", preferences['required-password']);
    const token = preferences['required-password'];
    fetchData(token)
      .then((result) => {
        console.log("HASIL", result);
        setData(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  return (
    <List isLoading={loading}>
      <List.Item
          icon={{ source: "wallet.png" }}
          key='balance'
          title='Balance'
          accessories={[{ text: loading? 'Loading...' : data?.data.balance.toString() }]}
        />
        <List.Item
          icon={{ source: "active.png" }}
          key='balance-active'
          title='Balance Active'
          accessories={[{ text: loading? 'Loading...' : data?.data.balanceActive.toString() }]}
        />
        <List.Item
          icon={{ source: "pending.png" }}
          key='balance-pending'
          title='Balance Pending'
          accessories={[{ text: loading? 'Loading...' : data?.data.balancePending.toString() }]}
        />
    </List>
  );
}