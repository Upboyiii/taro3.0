import { persist_storage } from "@/store/persist";

const SelectShop = (state = "", action) => {
    console.log(action, "action");
    switch (action.type) {
        case "SELECTSHOP":
            persist_storage(action.type, action.payload);
            return action.payload;
        default:
            return state;
    }

};

const SelectGift = (state = "", action) => {
    console.log(action, "action");
    switch (action.type) {
        case "SELECTGIFT":
            persist_storage(action.type, action.payload);
            return action.payload;
        default:
            return state;
    }
};

const SelectCoupon = (state = "", action) => {
    console.log(action, "action");
    switch (action.type) {
        case "SELECTCOUPON":
            persist_storage(action.type, action.payload);
            return action.payload;
        default:
            return state;
    }

};

const SelectDeatil = (state = "", action) => {
    console.log(action, "action");
    switch (action.type) {
        case "SELECTDEATIL":
            persist_storage(action.type, action.payload);
            return action.payload;
        default:
            return state;
    }

};



export default {
    SelectShop,
    SelectGift,
    SelectCoupon,
    SelectDeatil
};