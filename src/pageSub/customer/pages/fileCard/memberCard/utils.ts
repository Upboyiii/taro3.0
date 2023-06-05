import { secToDate } from "@/utils/common";

// 权益会员卡有效期格式化
export function formatLifeTime(time: any, expire_at = 0) {
  // console.log(time, "time");
  if (time && time.term_type) {
    if (time.term_type === 1) {
      return "永久有效";
    } else if (time.term_type === 2) {
      if (expire_at > 0) {
        return `${secToDate(expire_at)}之前有效`;
      } else {
        return `领卡时起${time?.term_days || 0}天内有效`;
      }
    } else if (time.term_type === 3) {
      if(!!time.term_begin_at && !!time.term_end_at){
        return `有效期：${secToDate(time.term_begin_at, "{y}.{M}.{d}")} - ${secToDate(time.term_end_at, "{y}.{M}.{d}")}`;
      }
    }
  }
  return "-";
}

// 权益会员卡领取购买条件
export function formatClaimType(item: any, condition = false) {
  let str = "";
  let claimType = item.claim_type;
  if (claimType === 1) {
    str = "可直接领取";
  } else if (claimType === 2) {
    str = "满足条件即可领取";
    let claimMeet = item.claim_meet;
    if (claimMeet && Array.isArray(claimMeet) && claimMeet.length > 0) {
      let meetType = ["累计支付成功", "累计消费金额", "累计总积分为"];
      let meetUnit = ["笔", "元", "分"];
      let meetList = Array.from(claimMeet, ({ meet_type, meet_value }) => {
        if (meet_type !== 0) {
          return `${meetType[meet_type - 1]}${meet_type !== 2 ? meet_value : meet_value / 100}${
            meetUnit[meet_type - 1]
          }`;
        }
      });
      if (meetList.length === 1) {
        str = meetList[0] + "可领取";
      }
      if (condition) {
        return {
          text: "满足以下任一条件即可领取：",
          list: meetList
        };
      }
    }
  } else if (claimType === 3) {
    str = "需付费购买";
    if (condition && item?.goods_rule?.price) {
      str += `，${(item?.goods_rule?.price / 100).toFixed(2)}元`;
    }
  }
  return str;
}
