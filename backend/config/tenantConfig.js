/**
 * Tenant Configuration
 * 
 * Define your tenant-to-database mappings here.
 * You can provide just the URI as a string, or an object with uri and dbName.
 */

export const tenants = {
    "donva": {
        uri: "mongodb+srv://mmubasharshahzad40_db_user:lecX9I03UTMWTnxn@cluster0.9r3kmcz.mongodb.net/?appName=Cluster0",
        dbName: "donva"
    },
    "seo": {
        uri: "mongodb+srv://mmubasharshahzad40_db_user:lecX9I03UTMWTnxn@cluster0.9r3kmcz.mongodb.net/?appName=Cluster0",
        dbName: "seo"
     },
      "socal_media_agency": {
        uri: "mongodb+srv://mmubasharshahzad40_db_user:lecX9I03UTMWTnxn@cluster0.9r3kmcz.mongodb.net/?appName=Cluster0",
        dbName: "socal_media_agency"
    }

     "email": {
        uri: "mongodb+srv://mmubasharshahzad40_db_user:lecX9I03UTMWTnxn@cluster0.9r3kmcz.mongodb.net/?appName=Cluster0",
        dbName: "email"
    }
};
