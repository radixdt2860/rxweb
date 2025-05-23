using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using CleanArchitecture.BoundedContext.SqlContext;
using CleanArchitecture.Models.Main;
using RxWeb.Core.Data;
using RxWeb.Core.Data.BoundedContext;
using RxWeb.Core.Data.Models;

namespace CleanArchitecture.BoundedContext.DbContext.Main
{
    public class LoginContext : BaseBoundedContext, ILoginContext
    {
        public LoginContext(
            MainSqlDbContext sqlDbContext,
            IOptions<DatabaseConfig> databaseConfig,
            IHttpContextAccessor contextAccessor,
            ITenantDbConnectionInfo tenantDbConnection
        ) : base(sqlDbContext, databaseConfig.Value, contextAccessor, tenantDbConnection)
        { }

        #region DbSets
        public DbSet<ApplicationUserToken>? ApplicationUserTokens { get; set; }
        public DbSet<UserRole>? UserRoles { get; set; }
        public DbSet<User>? User { get; set; }
        public DbSet<Role>? Roles { get; set; }
        public DbSet<RolePermission>? RolePermissions { get; set; }
        public DbSet<vUser>? Users { get; set; }
        #endregion
    }

    public interface ILoginContext : IDbContext
    {
    }
}
