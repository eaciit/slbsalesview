package main

import (
	"eaciit/slbsalesview/webapp/controllers"
	"eaciit/slbsalesview/webapp/helper"
	"eaciit/slbsalesview/webapp/models"
	"github.com/eaciit/acl/v1.0"
	"github.com/eaciit/knot/knot.v1"
	"github.com/eaciit/orm"
	tk "github.com/eaciit/toolkit"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

func main() {
	print("Preparing application")

	// ==== prepare config
	print("Reading configuration file")
	config := helper.ReadConfig()
	basePath, _ := os.Getwd()

	// ==== prepare database connection
	print("Connecting to db server", config.GetString("dbHost"), config.GetString("dbName"))
	conn, err := helper.PrepareConnection()
	if err != nil {
		print("> > >", err.Error())
		os.Exit(0)
	}
	print("> > >", "Connected!")

	// ==== configure acl
	print("Configuring ACL")
	acl.SetExpiredDuration(time.Second * time.Duration(config.GetFloat64("loginExpiration")))
	err = acl.SetDb(conn)
	if err != nil {
		print(err.Error())
		os.Exit(0)
	}

	// ==== save connection to controller context, and models
	ctx := orm.New(conn)
	baseCtrl := new(controllers.BaseController)
	baseCtrl.IsDevMode = config.GetString("isDevMode") == "true"
	baseCtrl.Conn = conn
	baseCtrl.AppName = ""
	baseCtrl.Ctx = ctx
	models.Conn = conn

	// create default access data for the first time
	print("Creating default access user (if is not exists)")
	err = helper.PrepareDefaultData()
	if err != nil {
		print("> > >", err.Error())
		os.Exit(0)
	}

	// create the application
	app := knot.NewApp(baseCtrl.AppName)
	app.LayoutTemplate = "_layout.html"
	app.ViewsPath = filepath.Join(basePath, "views") + tk.PathSeparator
	print("Configuring view location", app.ViewsPath)

	// register routes
	app.Register(&(controllers.AuthController{BaseController: baseCtrl}))
	app.Register(&(controllers.AccessController{BaseController: baseCtrl}))
	app.Register(&(controllers.DashboardController{BaseController: baseCtrl}))
	app.Register(&(controllers.DailySalesAnalysisController{BaseController: baseCtrl}))
	app.Register(&(controllers.BillingStageController{BaseController: baseCtrl}))
	app.Static("static", filepath.Join(basePath, "assets"))

	// registering other routes
	otherRoutes := map[string]knot.FnContent{
		"/": func(k *knot.WebContext) interface{} {
			urlLoginPage := "/auth/login"
			urlLandingPage := config.GetString("landingPage")

			if k.Session(controllers.SESSION_ID, "") == "" {
				if k.Request.URL.String() != `/` {
					unauthorizedErrorMessage := controllers.GetUnauthorizedMessageAsQueryString(k)
					urlLoginPage = urlLoginPage + unauthorizedErrorMessage
				}

				http.Redirect(k.Writer, k.Request, urlLoginPage, http.StatusTemporaryRedirect)
			} else {
				if k.Request.URL.String() == `/` {
					http.Redirect(k.Writer, k.Request, urlLandingPage, http.StatusTemporaryRedirect)
				}
			}

			return true
		},
	}

	// checking ssl
	ks := new(knot.Server)
	if config["ssl"].(bool) {
		print("Loading SSL private keys & certificate")

		ks.PrivateKeyPath = config.GetString("sslPrivateKeyPath")
		ks.CertificatePath = config.GetString("sslCertificatePath")
		ks.UseSSL = true

		print("> > > certificate path:", ks.CertificatePath, isFileFound(ks.CertificatePath))
		print("> > > private key path:", ks.PrivateKeyPath, isFileFound(ks.PrivateKeyPath))
	}

	// starting application
	container := new(knot.AppContainerConfig)
	container.Address = tk.Sprintf(":%d", config.GetInt("port"))

	knot.RegisterApp(app)
	knot.DefaultOutputType = knot.OutputTemplate

	print("Starting application")
	knot.StartContainerWithFn(container, otherRoutes, ks)
}

func print(a ...interface{}) {
	tk.Println(append([]interface{}{"           >"}, a...)...)
}

func isFileFound(filePath string) string {
	if tk.IsFileExist(filePath) {
		return "(found)"
	} else {
		return "(not found)"
	}
}
