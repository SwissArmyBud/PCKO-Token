import * as BasicTests from "./tests-basic";
import * as CharityTests from "./tests-charity";
import * as RaffleTests from "./tests-raffle";
import * as IllegalTests from "./tests-illegal";


// ------------------------------------
// ************************************
//   BASIC FEATURES
// *******************
// -------------------
describe("Basic Token Features", BasicTests.tests );


// ------------------------------------
// ************************************
//   CHARITY FEATURES
// *******************
// -------------------
describe("Charity Token Features", CharityTests.tests );


// ------------------------------------
// ************************************
//   RAFFLE FEATURES
// *******************
// -------------------
describe("Raffle Token Features", RaffleTests.tests );


// ------------------------------------
// ************************************
//   ILLEGAL ACTIONS
// *******************
// -------------------
describe("Illegal Contract Interactions", IllegalTests.tests);
