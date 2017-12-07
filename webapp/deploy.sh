# ===> rename packages
# $GOPATH/bin/gorep -from="eaciit/eaciit-project-boilerplate" -to="eaciit/yourproject"

# ===> prepare log
log_dirpath="logs/"
log_filename="log-$(date +%Y-%m-%d-%H-%M-%S).txt"
log_filepath="${log_dirpath}${log_filename}"
mkdir -p "$log_dirpath"
echo "log created at $log_filepath"
touch "$log_filepath"

# ===> restart app
sudo pkill executable
go build -o executable
nohup ./executable > "$log_filepath" &
