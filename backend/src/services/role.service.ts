import { createRoleByRoleName, deleteRoleByRoleName, findAllRoles, findByRoleNameByRoleName } from "#models/role.model";
import AppError from "#utils/AppError";

//Hàm tạo role tầng service
export const createRoleService = async(roleName: string, description: string) => {
    //Chuẩn hóa roleName trước khi xử lý
    const roleUpperCase = roleName.toUpperCase();

    //tạo biến existedRole để xem roleName đã tồn tại chưa
    const existedRole = await findByRoleNameByRoleName(roleUpperCase);

    //Kiểm tra roleName nếu tồn tại thì báo lỗi
    if(existedRole) throw new AppError(`Hiện tại role ${roleUpperCase} đã tồn tại`, 409);

    //Tạo biến newRole chứa dữ liệu trả về sau khi tạo thành công
    const newRole = await createRoleByRoleName(roleUpperCase, description);

    return {newRole};
}

//Hàm xóa role tầng service
export const deleteRoleService = async(roleName: string) => {
    //Chuẩn hóa roleName trước khi xử lý
    const roleUpperCase = roleName.toUpperCase();

    //tạo biến existedRole để xem roleName đã tồn tại chưa
    const existedRole = await findByRoleNameByRoleName(roleUpperCase);

    if(!existedRole) throw new AppError(`Không tìm thấy ${roleUpperCase} để xóa`, 404);

    

    const delRole = await deleteRoleByRoleName(roleUpperCase);

    return {delRole};
}

//Hàm lấy tất cả role
export const getAllRolesService = async() => {
    return await findAllRoles();
}