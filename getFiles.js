// const db = require("./config/db");
// const handouts = require("./handouts.json");

// (async () => {
//   const sql = `
//     UPDATE courses
// SET
//   handout_pdf = CASE
//     WHEN slug LIKE 'cs726-%' THEN '1wk_wWi21y_KbNMEk60CkDKe5ftCjEkwL'
//     WHEN slug LIKE 'cs724-%' THEN '1aXM18CN66CxeqV64NK9g3iywVTpsx9SG'
//     WHEN slug LIKE 'cs723-%' THEN '1l7UKWrKZQIEWwOPCEl4lsYGV6XlbqjAF'
//     WHEN slug LIKE 'cs718-%' THEN '17asoh3dGDH5LB0zr3Gyq2aulPiEwWRm0'
//     WHEN slug LIKE 'cs711-%' THEN '1MgqMKCoTi8Ce2n9kacoYBByUfx_caPH1'
//     WHEN slug LIKE 'cs707-%' THEN '1Pp4BADdeTsKqb4pBFUsCu1dgR5YFAO9v'
//     WHEN slug LIKE 'cs706-%' THEN '1elj1ChxozbT1MUR4TD_OUoUf0MaOLCRc'
//     WHEN slug LIKE 'cs704-%' THEN '1Skc8jWPupKUIHGG87p0JIaCB1SB5fcbd'
//     WHEN slug LIKE 'cs703-%' THEN '1C2jwhrlwJpp7rCE4beebjThZ5GmC39Qp'
//     WHEN slug LIKE 'cs702-%' THEN '1l46tRVkFniVYE3joGCS19BANSS1Z82J0'
//     WHEN slug LIKE 'cs701-%' THEN '1yZBpd0vDQnFd29yJu-Vu3UrMKesKrFIm'
//     WHEN slug LIKE 'cs615-%' THEN '1-iW5hmpZbx41-p9M0DhowUUkMHWzSvC8'
//     WHEN slug LIKE 'cs611-%' THEN '10_feSrcxArLQUlIwHbXG3rNT_8Ip5Afb'
//     WHEN slug LIKE 'cs614-%' THEN '1LIvlzygJ8GIKCdeXmKF-MCPIS4de75zb'
//     WHEN slug LIKE 'cs610-%' THEN '1q3NVmFaiR3YPLHEUPeLPA9eKNAGn0FAi'
//     WHEN slug LIKE 'cs608-%' THEN '1k0_rkl--cTsbByim3mcNt6ZrB5grmh9I'
//     WHEN slug LIKE 'cs609-%' THEN '1tO9ILUgYwGZoeGMtZmqSdILCwszLmtRn'
//     WHEN slug LIKE 'cs607-%' THEN '1576aznpLKz0TqoJT6wlk6tviUl9Wh-Gy'
//     WHEN slug LIKE 'cs606-%' THEN '1rI8wNgNm0_Xg-fbBIC05Duv1YcZGNPlR'
//     WHEN slug LIKE 'cs605-%' THEN '1h_0AndXlMYMo5FGTULgdI4isr31H6JXW'
//     WHEN slug LIKE 'cs604-%' THEN '1_SVDDGcJnt6Mr_3a9SNGKauF0xidyvBY'
//     WHEN slug LIKE 'cs603-%' THEN '1iZe_QkgHw1jRnmpH5TqaF4-Kfp5LLfkG'
//     WHEN slug LIKE 'cs602-%' THEN '1LuJm_gawfB6Bkdoy6xatWWyTBcXNt3Nt'
//     WHEN slug LIKE 'cs508-%' THEN '19PdYeywUZQvSi9eCi59_4UswSSl6FNqU'
//     WHEN slug LIKE 'cs507-%' THEN '1RnX-L8P116_iNugesipmLD-wMB8cuwaC'
//     WHEN slug LIKE 'cs506-%' THEN '11DTjGEb6MfWWkNOGueoRXiJevINuIsBy'
//     WHEN slug LIKE 'cs502-%' THEN '1kb5-BcVWAxwxCOzJAPJFWiGDNHyO1Zy7'
//     WHEN slug LIKE 'cs501-%' THEN '1XCuor7uEw8SFSV467oPDvZc9AsGqY6Iu'
//     WHEN slug LIKE 'cs435-%' THEN '1Q_UETxPbHnsThGp385TJLD_ZTJcM4_3I'
//     WHEN slug LIKE 'cs432-%' THEN '11c93eoRJxY5PLaKSWnGUtz57aCfCk5zm'
//     WHEN slug LIKE 'cs411-%' THEN '19CsuwXVb0sX1Ext9LfrMLO647bva7_nl'
//     WHEN slug LIKE 'cs410-%' THEN '1VMHvXo8WwSkqsmyWiQR8QYwjBOPXBO2S'
//     WHEN slug LIKE 'cs407-%' THEN '1p-d1VuoQBC4GNplJjOzJYM8wji1-tP9W'
//     WHEN slug LIKE 'cs405-%' THEN '1wP3W5GHHhpKqCELlJV8i5cpxEV1428W2'
//     WHEN slug LIKE 'cs401-%' THEN '1uaUZjjeS1s0zKtPwKcioKy_2ZHuwSce4'
//     WHEN slug LIKE 'cs312-%' THEN '1OUGrSyOUd9-E9EUjrCORMu9SVopC12cy'
//     WHEN slug LIKE 'cs311-%' THEN '1gsWlZZfjHWEzHPeF_21kuHN2_bgHo4Ww'
//     WHEN slug LIKE 'cs302-%' THEN '19xvUVn2mswNFT31AXVnDlksaHHHR_15r'
//     WHEN slug LIKE 'cs206-%' THEN '10KcDAYPOVJXCEdgYQnkoM9aYmF6lKGTs'
//     WHEN slug LIKE 'cs304-%' THEN '1lorvjiGr1xMdhO-UmPqILoD5zCrKPU1P'
//     WHEN slug LIKE 'cs504-%' THEN '1D6WQyxQbQKDRalYGZS2OiOpk6A0tqMNg'
//     WHEN slug LIKE 'cs301-%' THEN '1I9bjxFlYhxPy4NR1MsoCIvd6b_fOu7Je'
//     WHEN slug LIKE 'cs202-%' THEN '1zvB5aPniSLcfkxg0JBh3xh_7mp2mO9Fb'
//     WHEN slug LIKE 'cs101-%' THEN '1NhvTSFgJ-Ywa84d0LW68w5uwIWJSQVh5'
//     WHEN slug LIKE 'cs205-%' THEN '1_BjiM3WhFW_V_SPlpAA4E-gDDTF8VV76'
//     WHEN slug LIKE 'cs201-%' THEN '1DsZiaKz2vBDsMe98ia5jz5ti23OM8YFs'
//     WHEN slug LIKE 'cs601-%' THEN '1jxwqKReAL-kEy4mStVzAo2gG_AzhewRU'
//     WHEN slug LIKE 'cs403-%' THEN '1J0ZnzjcDFmYyU7KkaExXcZhwHQDvFvtj'
//     WHEN slug LIKE 'mth202-%' THEN '175E2sUQy_mgCPn2ESfrD3rGnqWU7Adz1'
//     WHEN slug LIKE 'sta301-%' THEN '1R8tphiIfwA8PejZ2a6MuN8x1Dm7eIRin'
//   END,
//   handout_original_filename = CASE
//     WHEN slug LIKE 'cs726-%' THEN 'CS726_Handouts.pdf'
//     WHEN slug LIKE 'cs724-%' THEN 'CS724_Handouts.pdf'
//     WHEN slug LIKE 'cs723-%' THEN 'CS723_Handouts.pdf'
//     WHEN slug LIKE 'cs718-%' THEN 'CS718_Handouts.pdf'
//     WHEN slug LIKE 'cs711-%' THEN 'CS711_handouts.pdf'
//     WHEN slug LIKE 'cs707-%' THEN 'CS707_Handouts.pdf'
//     WHEN slug LIKE 'cs706-%' THEN 'CS706_Handouts.pdf'
//     WHEN slug LIKE 'cs704-%' THEN 'CS704_Handouts.pdf'
//     WHEN slug LIKE 'cs703-%' THEN 'CS703_Handouts.pdf'
//     WHEN slug LIKE 'cs702-%' THEN 'CS702_Handouts.pdf'
//     WHEN slug LIKE 'cs701-%' THEN 'CS701_Handouts.pdf'
//     WHEN slug LIKE 'cs615-%' THEN 'CS615_Handouts.pdf'
//     WHEN slug LIKE 'cs611-%' THEN 'CS611_Handouts.pdf'
//     WHEN slug LIKE 'cs614-%' THEN 'CS614_Handouts.pdf'
//     WHEN slug LIKE 'cs610-%' THEN 'CS610_Handouts.pdf'
//     WHEN slug LIKE 'cs608-%' THEN 'CS608_Handouts.pdf'
//     WHEN slug LIKE 'cs609-%' THEN 'CS609_Handouts.pdf'
//     WHEN slug LIKE 'cs607-%' THEN 'CS607_Handouts.pdf'
//     WHEN slug LIKE 'cs606-%' THEN 'CS606_Handouts.pdf'
//     WHEN slug LIKE 'cs605-%' THEN 'CS605_Handouts.pdf'
//     WHEN slug LIKE 'cs604-%' THEN 'CS604_Handouts.pdf'
//     WHEN slug LIKE 'cs603-%' THEN 'CS603_Handouts.pdf'
//     WHEN slug LIKE 'cs602-%' THEN 'CS602_Handouts.pdf'
//     WHEN slug LIKE 'cs508-%' THEN 'CS508_Handouts.pdf'
//     WHEN slug LIKE 'cs507-%' THEN 'CS507_Handouts.pdf'
//     WHEN slug LIKE 'cs506-%' THEN 'CS506_handouts.pdf'
//     WHEN slug LIKE 'cs502-%' THEN 'CS502_handouts.pdf'
//     WHEN slug LIKE 'cs501-%' THEN 'CS501_handouts.pdf'
//     WHEN slug LIKE 'cs435-%' THEN 'CS435_Handouts.pdf'
//     WHEN slug LIKE 'cs432-%' THEN 'CS432_Handouts.pdf'
//     WHEN slug LIKE 'cs411-%' THEN 'CS411_Handouts.pdf'
//     WHEN slug LIKE 'cs410-%' THEN 'CS410_handouts.pdf'
//     WHEN slug LIKE 'cs407-%' THEN 'CS407_Handouts.pdf'
//     WHEN slug LIKE 'cs405-%' THEN 'CS405_Handouts.pdf'
//     WHEN slug LIKE 'cs401-%' THEN 'CS401_handouts.pdf'
//     WHEN slug LIKE 'cs312-%' THEN 'CS312_ Handouts.pdf'
//     WHEN slug LIKE 'cs311-%' THEN 'CS311_Handouts.pdf'
//     WHEN slug LIKE 'cs302-%' THEN 'CS302_Handouts.pdf'
//     WHEN slug LIKE 'cs206-%' THEN 'CS206_Handouts.pdf'
//     WHEN slug LIKE 'cs304-%' THEN 'CS304_Handouts.pdf'
//     WHEN slug LIKE 'cs504-%' THEN 'CS504_Handouts.pdf'
//     WHEN slug LIKE 'cs301-%' THEN 'CS301_Handouts.pdf'
//     WHEN slug LIKE 'cs202-%' THEN 'CS202_Handouts.pdf'
//     WHEN slug LIKE 'cs101-%' THEN 'CS101_Handouts.pdf'
//     WHEN slug LIKE 'cs205-%' THEN 'CS205_Handouts.pdf'
//     WHEN slug LIKE 'cs201-%' THEN 'CS201_Handouts.pdf'
//     WHEN slug LIKE 'cs601-%' THEN 'CS601_Handouts.pdf'
//     WHEN slug LIKE 'cs403-%' THEN 'CS403_Handouts.pdf'
//     WHEN slug LIKE 'mth202-%' THEN 'MTH202_HANDOUTS.pdf'
//     WHEN slug LIKE 'sta301-%' THEN 'STA301_Handouts.pdf'
//   END;

//   `;

//   console.log(sql); // preview
//   await db.execute(sql);
//   console.log("✅ Bulk update complete");
//   process.exit();
// })();

//=====================================================================================================

const db = require("./config/db");
const lectures = require("./lectures.json");

const COURSE_ID = 540043; // change this to the course_id you want

(async () => {
  try {
    const values = Object.entries(lectures).map(([title, { start_page, end_page }]) => {
      return `(${COURSE_ID}, ${db.escape(title)}, 0, ${start_page}, ${end_page})`;
    });

    const sql = `
      INSERT INTO lectures (course_id, title, total_questions, start_page, end_page)
      VALUES ${values.join(",\n")};
    `;

    console.log(sql); // preview query
    await db.execute(sql);
    console.log("✅ Bulk create complete");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    process.exit();
  }
})();