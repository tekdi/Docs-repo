
Upgrading the major version requires more attention. Backward-incompatible changes are reserved for major versions. 
A major upgrade requires the following steps:

1. Take the backup of your gitlab server to prevent any loss of your important data.

2. Start by identifying a supported upgrade path. This is essential for a successful major version upgrade.

3. Upgrade to the latest minor version of the preceding major version.

4. Upgrade to the “dot zero” release of the next major version (X.0.Z).

`Step 1`:

Create backup of  gitlab server

```
Sudo gitlab-backup create
```

`Step 2`:

Then go through the link to get the upgrade path https://gitlab-com.gitlab.io/support/toolbox/upgrade-path/ 
and fill the required details like,  current version and edition of your gitlab then required version. You will get a supported upgrade path overview. In which you will get the all version upgrade commands.


`Step 3`:

After every installation do the reconfiguration of gitlab and check the data is up to date.

```
Sudo gitlab-ctl reconfigure 
```

`Step 4`:

On major version upgradation you might get below error of migration


```
rails_migration[gitlab-rails] (gitlab::database_migrations line 51) had an error: Mixlib::ShellOut::ShellCommandFailed: bash[migrate gitlab-rails database] (/opt/gitlab/embedded/cookbooks/cache/cookbooks/gitlab/resources/rails_migration.rb line 16) had an error: Mixlib::ShellOut::ShellCommandFailed: Expected process to exit with [0], but received '1'
---- Begin output of "bash"  "/tmp/chef-script20230512-614-q0fzu8" ----
STDOUT: rake aborted!
StandardError: An error has occurred, all later migrations canceled:
Expected batched background migration for the given configuration to be marked as 'finished', but it is 'active':	{:job_class_name=>"CopyColumnUsingBackgroundMigrationJob", :table_name=>"taggings", :column_name=>"id", :job_arguments=>[["id", "taggable_id"], ["id_convert_to_bigint", "taggable_id_convert_to_bigint"]]}
```

Then you have to finalize it manually by running 

```
sudo gitlab-rake gitlab:background_migrations:finalize[CopyColumnUsingBackgroundMigrationJob,taggings,id,'[["id"\, "taggable_id"]\, ["id_convert_to_bigint"\, "taggable_id_convert_to_bigint"]]']
```
Before running the next command, wait for a few minutes to finalize it. Then run the next command.
 
```
gititlab-rake db:migrate
```
```
gitlab-ctl reconfigure
```
`Step 5`:

While upgrading you might get a migration error of  `oauth access token expire`. 
Then follow the below steps one by one

connect to gitlab postgres db:
```
sudo gitlab-psql
\l
\c gitlabhq_production
UPDATE oauth_access_tokens SET expires_in = '7200' WHERE expires_in IS NULL;
```
Then come out from postgresDB with
```
exit
```
Run the final migrations:

```
sudo gitlab-rake db:migrate
```
on the last do the reconfiguration and install next version.
```
sudo gitlab-ctl reconfigure
```

