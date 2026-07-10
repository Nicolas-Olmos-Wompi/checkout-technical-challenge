export class GetServerHealthStatusMapper {
  public static toDTO(healthStatus: boolean): string {
    if (healthStatus) {
      return "I'm alive!";
    }
    return 'Database issue. Unhealthy';
  }
}
