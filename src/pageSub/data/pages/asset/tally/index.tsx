// @ts-ignore
import React, { FC, useState, useEffect } from "react";
import { View } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { assetsApi } from "@/api/co_admin";
import { eventCenterOff, eventCenterOn, navigateTo } from "@/utils/library";
import { formatPrice } from "@/utils/common";
import Cell from "@/components/cell";
import Button from "@/components/button";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const Tally: FC = () => {

  const [loading, setLoading] = useState(false);
  const [finance, setFinance] = useState({
    marks: {
      balance: 0,
      wait_balance: 0
    },
    cash: {
      balance: 0,
      wait_balance: 0
    }
  });

  const getFinance = (type) => {
    setLoading(true);
    assetsApi.finance.balance({ type: type })
      .then(res => {
        if (res.code === 0) {
          setFinance(prevState => {
            let temp = JSON.parse(JSON.stringify(prevState));
            if(type === 1){
              temp.marks.balance = res.data?.balance || 0;
              temp.marks.wait_balance = res.data?.wait_balance || 0;
            }
            if(type === 7){
              temp.cash.balance = res.data?.balance || 0;
              temp.cash.wait_balance = res.data?.wait_balance || 0;
            }
            return temp;
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getFinanceList = () => {
    getFinance(1);
    getFinance(7);
  };

  useEffect(() => {
    getFinanceList();
    eventCenterOn("tally", () => {
      getFinanceList();
    });
    return () => {
      eventCenterOff("tally");
    };
  }, []);

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <View style={scrollViewStyle()}>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Cell
            title="标记资金(元)"
            label={!loading ? formatPrice(finance.marks.balance) : "-.--"}
            labelStyle={{
              color: "#333",
              fontSize: addUnit(28),
              fontWeight: "bold",
              lineHeight: addUnit(36)
            }}
            arrow
            onClick={() => {
              navigateTo({ method:"navigateTo",url: "/pages/data/asset/tally/records/index?type=3" });
            }}
          />
        </View>
        <View className="card">
          <Cell
            title="现金(元)"
            label={!loading ? formatPrice(finance.cash.balance) : "-.--"}
            labelStyle={{
              color: "#333",
              fontSize: addUnit(28),
              fontWeight: "bold",
              lineHeight: addUnit(36)
            }}
            arrow
            onClick={() => {
              navigateTo({ method:"navigateTo",url: "/pages/data/asset/tally/records/index?type=7" });
            }}
          />
        </View>
      </View>
      <BottomBar>
        <Button
          style={{ width: "70%" }}
          type="info"
          onClick={() => {
            navigateTo({ method:"navigateTo",url: "/pages/data/asset/tally/booking/index" });
          }}
        >
          记一笔
        </Button>
      </BottomBar>
    </View>
  );
};

export default Tally;

