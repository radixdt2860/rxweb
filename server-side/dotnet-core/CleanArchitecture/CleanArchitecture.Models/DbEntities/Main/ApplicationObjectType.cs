using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using RxWeb.Core.Annotations;
using RxWeb.Core.Data.Annotations;
using RxWeb.Core.Sanitizers;
using CleanArchitecture.Models.Enums.Main;
using CleanArchitecture.BoundedContext.SqlContext;
namespace CleanArchitecture.Models.Main
{
    [Table("ApplicationObjectTypes",Schema="dbo")]
    public partial class ApplicationObjectType
    {
		#region ApplicationObjectTypeId Annotations

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [System.ComponentModel.DataAnnotations.Key]
		#endregion ApplicationObjectTypeId Annotations

        public int ApplicationObjectTypeId { get; set; }

		#region ApplicationObjectTypeName Annotations

        [Required]
        [MaxLength(100)]
		#endregion ApplicationObjectTypeName Annotations

        public string ApplicationObjectTypeName { get; set; }

		#region StatusId Annotations

        [Range(1, int.MaxValue)]
        [Required]
		#endregion StatusId Annotations

        public int StatusId { get; set; }


        public virtual ICollection<ApplicationObject> ApplicationObjects { get; set; }


        public ApplicationObjectType()
        {
			ApplicationObjects = new HashSet<ApplicationObject>();
        }
	}
}