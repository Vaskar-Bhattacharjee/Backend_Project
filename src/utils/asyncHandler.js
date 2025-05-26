
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(
            requestHandler(req, res, next)
        ).catch((err) => next(err))
    }
}
export default asyncHandler;

// const asyncHandler = (requestHandler) => {
//     (req, res, next) => {
//         Promise.resolve(
//             requestHandler(req, res, next)
//         ).catch((err) => next(err))
//     }
// }




// const asyncHandler = (fn) => async(rew, res, next) => {
//     try {
//         await fn(rew, res, next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }




// const asyncHandler = (fn) => async(req, res, next) => {
//         try {
//             await fn(req, res, next);
//         } catch (error) {
//             res.status(error.code || 500).json({
//                 success: false,
//                 message: error.message
//             })
//         }
//     };
    
//     export default asyncHandler;

