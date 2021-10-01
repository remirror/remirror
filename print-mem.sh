while true
do
  sleep 1
  date
  ps -eo size,pid,user,command --sort -size | \
      awk '{ hr=$1/1024 ; printf("%13.2f Mb ",hr) } { for ( x=4 ; x<=NF ; x++ ) { printf("%s ",$x) } print "" }' |\
      cut -d "" -f2 |\
      cut -d "-" -f1 |\
      grep node
done
