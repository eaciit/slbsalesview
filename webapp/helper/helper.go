package helper

import (
	acl "github.com/eaciit/acl/v1.0"
	db "github.com/eaciit/dbox"
	_ "github.com/eaciit/dbox/dbc/mongo"
	tk "github.com/eaciit/toolkit"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"time"
)

var (
	cacheConfig = make(tk.M)
	basePath    = (func(dir string, err error) string { return dir }(os.Getwd()))
)

func PrepareConnection() (db.IConnection, error) {
	config := ReadConfig()
	connInfo := &db.ConnectionInfo{
		Host:     config.GetString("dbHost"),
		Database: config.GetString("dbName"),
		UserName: config.GetString("dbUsername"),
		Password: config.GetString("dbPassword"),
		Settings: tk.M{}.Set("timeout", config.GetFloat64("dbTimeout")),
	}

	conn, err := db.NewConnection("mongo", connInfo)
	if err != nil {
		return nil, err
	}

	err = conn.Connect()
	if err != nil {
		return nil, err
	}

	return conn, nil
}

func ReadConfig() tk.M {
	if len(cacheConfig) > 0 {
		return cacheConfig
	}

	configPath := filepath.Join(basePath, "conf", "app.json")
	res := make(tk.M)

	bts, err := ioutil.ReadFile(configPath)
	if err != nil {
		tk.Println("Error when reading config file.", err.Error())
		os.Exit(0)
	}

	err = tk.Unjson(bts, &res)
	if err != nil {
		tk.Println("Error when reading config file.", err.Error())
		os.Exit(0)
	}

	if !res.Has("dbTimeout") {
		res.Set("dbTimeout", 10)
	}

	for key := range res {
		if strings.HasPrefix(res.GetString(key), "./") {
			newPath := filepath.Join(configPath, "..", strings.Replace(res.GetString(key), "./", "", 1))
			res.Set(key, newPath)
		}
	}

	cacheConfig = res
	return res
}

func PrepareDefaultData() error {
	username := "eaciit"

	user := new(acl.User)
	err := acl.FindUserByLoginID(user, username)
	if err == nil || user.LoginID == username {
		return err
	}

	// ========= access menu

	access1 := new(acl.Access)
	access1.ID = "dashboard"
	access1.Title = "Dashboard"
	access1.Category = 1
	access1.Icon = "bar-chart"
	access1.Url = "/dashboard/index"
	access1.Index = 1
	access1.Enable = true
	err = acl.Save(access1)
	if err != nil {
		return err
	}

	access2 := new(acl.Access)
	access2.ID = "master_data"
	access2.Title = "Master Data"
	access2.Category = 1
	access2.Icon = "database"
	access2.Url = "/access/master"
	access2.Index = 2
	access2.Enable = true
	err = acl.Save(access2)
	if err != nil {
		return err
	}

	// ======= groups

	group1 := new(acl.Group)
	group1.ID = "admin"
	group1.Title = "admin"
	group1.Enable = true
	group1.Grants = []acl.AccessGrant{
		{AccessID: access1.ID, AccessValue: 1}, // dashboard
		{AccessID: access2.ID, AccessValue: 1}, // master
	}
	group1.GroupConf = tk.M{}
	group1.MemberConf = tk.M{}
	err = acl.Save(group1)
	if err != nil {
		return err
	}

	group2 := new(acl.Group)
	group2.ID = "user"
	group2.Title = "user"
	group2.Enable = true
	group2.Grants = []acl.AccessGrant{
		{AccessID: access1.ID, AccessValue: 1}, // dashboard
	}
	group2.GroupConf = tk.M{}
	group2.MemberConf = tk.M{}
	err = acl.Save(group2)
	if err != nil {
		return err
	}

	// ====== user

	password := "Password.1"

	user1 := new(acl.User)
	user1.ID = tk.RandomString(32)
	user1.LoginID = "eaciit"
	user1.FullName = "EACIIT"
	user1.Email = "admin@eaciit.com"
	user1.Enable = true
	user1.Groups = []string{group1.ID} // [admin]
	err = acl.Save(user1)
	if err != nil {
		return err
	}
	err = acl.ChangePassword(user1.ID, password)
	if err != nil {
		return err
	}

	user2 := new(acl.User)
	user2.ID = tk.RandomString(32)
	user2.LoginID = "user"
	user2.FullName = "Standard User"
	user2.Email = "user@eaciit.com"
	user2.Enable = true
	user2.Groups = []string{group2.ID} // [user]
	err = acl.Save(user2)
	if err != nil {
		return err
	}
	err = acl.ChangePassword(user2.ID, password)
	if err != nil {
		return err
	}

	return nil
}

func InTimeSpan(start, finish, check time.Time) bool {
	return check.After(start) && check.Before(finish)
}

func IsTimeBefore(start, finish time.Time) bool {
	return start.Before(finish)
}

func IsTimeAfter(start, finish time.Time) bool {
	return finish.Before(start)
}
