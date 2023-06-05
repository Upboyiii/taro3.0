"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callInterceptor = void 0;
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const _1 = require(".");
function callInterceptor(options) {
    const { interceptor, args, done, canceled } = options;
    if (interceptor) {
        // eslint-disable-next-line prefer-spread
        const returnVal = interceptor.apply(null, args || []);
        if ((0, _1.isPromise)(returnVal)) {
            returnVal
                .then((value) => {
                if (value) {
                    done();
                }
                else if (canceled) {
                    canceled();
                }
            })
                .catch(_1.noop);
        }
        else if (returnVal) {
            done();
        }
        else if (canceled) {
            canceled();
        }
    }
    else {
        done();
    }
}
exports.callInterceptor = callInterceptor;
//# sourceMappingURL=interceptor.js.map