# Small World Visualizer
小世界可视化工具/スモールワールド可視化ツール

https://jsc723.github.io/smallworld-visualizer/

# Database Updates

## 在Google Cloud部署服务自动更新数据库
1. Cloud Storage建立bucket，给Public和CORS权限
2. Cloud Functions部署scripts/updateDB.py，给AllUsers Invoke权限
3. 在Cloud Scheduler设置定时任务（例如每周运行一次）

## 手动
在[这里](https://ygocdb.com/api/v0/cards.zip)下载，解压后放到scripts/ygocdb.com.cards/cards.json
运行scripts/cdb.py


